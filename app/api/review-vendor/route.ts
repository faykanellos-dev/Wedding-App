import Anthropic from "@anthropic-ai/sdk";
import { clientIp, getProEntitlement } from "@/lib/proServer";
import { rateLimit } from "@/lib/rateLimit";

// Runs on Vercel's Node.js runtime (not the Edge runtime) since the
// Anthropic SDK needs Node APIs, and gets extra time since a web-search-
// backed review can take a while to come back.
export const runtime = "nodejs";
export const maxDuration = 60;

const RUBRIC = `You are helping a professional wedding planner with 30+ years of experience
screen vendors that her clients are considering. Research the vendor using web search
(their reputation, reviews, complaints, and any public information you can find —
Google reviews, Facebook, Instagram, wedding forums, news, etc.) and the notes provided,
then decide whether this vendor is a GREEN FLAG (safe to proceed, book with confidence)
or a RED FLAG (proceed with caution or avoid) for a couple planning a wedding.

Weigh these signals:
- Pricing transparency (clear pricing vs. vague/quote-only with no detail)
- Contract & deposit practices (clear written contracts vs. no contract, unusual deposit demands)
- Communication (responsive and professional vs. slow, evasive, or unprofessional)
- Reputation (genuine positive reviews and a real portfolio vs. no reviews, mostly negative
  reviews, complaints about no-shows/cancellations/poor quality, or reviews that look fake)
- Availability & reliability (a real, operating business vs. signs of overbooking, sudden
  closures, or scam reports)

Give the vendor the benefit of the doubt on minor or ambiguous signals — only flag red when
there is a real, concrete concern, not just "no data found." If you can find almost nothing
about the vendor at all, lean green but say so plainly in the summary.

After researching, respond with ONLY a single JSON object as your entire final message —
no markdown fences, no text before or after it — in exactly this shape:
{"flag":"green"|"red","headline":"<8 words or fewer>","summary":"<2-3 plain sentences a bride would read, explaining why>","sources":[{"title":"<source title>","url":"<source url>"}]}
Include at most 3 of the most relevant sources you actually used. If you found no useful
sources, use an empty array.`;

type ParsedReview = {
  flag?: string;
  headline?: string;
  summary?: string;
  sources?: { title: string; url: string }[];
};

export async function POST(request: Request) {
  // Pro is enforced HERE, on the server. The client-side lock is only for
  // show — anyone can call this endpoint directly, so without this check
  // the feature would be free (and each call costs real Anthropic credits).
  const entitlement = getProEntitlement(request);
  if (!entitlement) {
    return Response.json(
      { error: "AI vendor reviews are a Pro feature. Upgrade to Pro (or re-enter your Pro code) to use them." },
      { status: 402 }
    );
  }

  // Cost guard: per-IP and per-Pro-code caps (best-effort, per server instance).
  if (
    !rateLimit(`review-ip:${clientIp(request)}`, 20, 60 * 60 * 1000) ||
    !rateLimit(`review-code:${entitlement}`, 300, 24 * 60 * 60 * 1000)
  ) {
    return Response.json({ error: "You've hit the review limit for now. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 200) : "";
    const url = typeof body?.url === "string" ? body.url.trim().slice(0, 500) : "";
    const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 2000) : "";
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 100) : "";

    if (!name) {
      return Response.json({ error: "Vendor name is required." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "AI reviews aren't configured yet — missing ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const userMessage = [
      `Vendor name: ${name}`,
      category ? `Category: ${category}` : null,
      url ? `Link provided by the user: ${url}` : null,
      notes ? `Notes from the user: ${notes}` : `Notes from the user: (none provided)`,
    ]
      .filter(Boolean)
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: RUBRIC,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlocks = message.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    const finalText = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text.trim() : "";

    const jsonMatch = finalText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "The AI review didn't come back in a format we could read. Try again." },
        { status: 502 }
      );
    }

    let parsed: ParsedReview;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return Response.json(
        { error: "The AI review didn't come back in a format we could read. Try again." },
        { status: 502 }
      );
    }

    if (parsed.flag !== "green" && parsed.flag !== "red") {
      return Response.json(
        { error: "The AI review didn't come back in a format we could read. Try again." },
        { status: 502 }
      );
    }

    return Response.json({
      flag: parsed.flag,
      headline: parsed.headline || (parsed.flag === "green" ? "Looks good" : "Proceed with caution"),
      summary: parsed.summary || "",
      sources: Array.isArray(parsed.sources) ? parsed.sources.slice(0, 3) : [],
      reviewedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("review-vendor error:", err);
    return Response.json({ error: "Something went wrong generating the review. Please try again." }, { status: 500 });
  }
}
