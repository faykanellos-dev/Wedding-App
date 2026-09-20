// AI vendor review — app-spec.md §9 (Pro feature).
//
// Takes the vendor details already saved in the Wishlist (name, category,
// url, notes) and asks Claude to weigh them against lib/vendorStandards.ts,
// returning a structured red-flag / all-clear result. This does NOT browse
// the vendor's actual website or pull real reviews — it works purely from
// what the couple typed in, plus general knowledge of what tends to go
// wrong with this category of vendor. See README.md for the env var this
// needs and a note on per-scan cost.

import { NextRequest, NextResponse } from "next/server";
import { standardsForCategory } from "@/lib/vendorStandards";

// "claude-sonnet-5" is a good default balance of quality vs. cost for this.
// Since this is a real API call per scan (see app-spec.md §9's build note),
// you can swap in a cheaper model — e.g. "claude-haiku-4-5-20251001" — here
// if per-scan cost matters more than review depth.
const MODEL = "claude-sonnet-5";

type ReviewRequestBody = {
  name?: string;
  categoryId?: string;
  categoryName?: string;
  url?: string;
  notes?: string;
};

type RawReviewItem = {
  type?: string;
  observation?: string;
  question?: string | null;
};

type RawReview = {
  allClear?: boolean;
  headline?: string;
  caveat?: string | null;
  items?: RawReviewItem[];
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI review isn't configured yet — ANTHROPIC_API_KEY is missing on the server." },
      { status: 500 }
    );
  }

  let body: ReviewRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
  }
  const categoryId = body.categoryId ?? "other";
  const categoryName = body.categoryName ?? "Vendor";
  const url = (body.url ?? "").trim();
  const notes = (body.notes ?? "").trim();

  const standards = standardsForCategory(categoryId);

  const prompt = `You are reviewing a wedding vendor on behalf of an experienced wedding planner (30+ years, 200+ weddings), for a bride-to-be using her planning app. You have NOT browsed the internet and have NO real information about this specific vendor beyond what's given below — do not invent facts, reviews, or claims about them.

Vendor being considered:
- Name: ${name}
- Category: ${categoryName}
- Website/link: ${url || "(not provided)"}
- Notes from the couple: ${notes || "(none)"}

Your job is NOT to fabricate findings about this specific vendor. Instead, based on the category and any notes given, surface the most relevant checks and questions a couple should raise with THIS TYPE of vendor before booking. Use these planning standards as your checklist:

${standards.map((s) => `- ${s}`).join("\n")}

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "allClear": boolean,
  "headline": string,
  "caveat": string | null,
  "items": [
    { "type": "flag" | "green", "observation": string, "question": string | null }
  ]
}

Rules:
- If the notes give genuine reason for concern (e.g. mention a bad experience, vague pricing, no contract), set allClear=false, pick 2-3 "flag" items (each a short observation plus a concrete question to ask the vendor) and at least 1 "green" item (something reassuring or neutral, to keep it balanced), and a headline like "2 things to check before booking".
- If there's nothing in the given information to raise concern, set allClear=true, headline like "Nothing concerning found so far", caveat "Still worth a call before you book to confirm the details below", and exactly 3 "green" items — these double as confirmation questions the couple should still ask this category of vendor.
- "question" must be null for "green" items and a real, concrete question for "flag" items.
- Keep each observation and question to one short sentence. Plain, warm, non-alarmist tone — this is guidance, not an accusation.`;

  let aiRes: Response;
  try {
    aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    console.error("review-vendor: network error calling Anthropic", err);
    return NextResponse.json({ error: "Couldn't reach the AI service — try again in a moment." }, { status: 502 });
  }

  if (!aiRes.ok) {
    const text = await aiRes.text().catch(() => "");
    console.error("review-vendor: Anthropic API error", aiRes.status, text);
    return NextResponse.json({ error: "The AI review failed — try again in a moment." }, { status: 502 });
  }

  const aiJson = await aiRes.json();
  const raw: string = aiJson?.content?.[0]?.text ?? "";

  let parsed: RawReview;
  try {
    // The model is instructed to return raw JSON, but strip code fences
    // defensively in case it wraps the response in ```json anyway.
    const cleaned = raw
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("review-vendor: couldn't parse model output", raw, err);
    return NextResponse.json({ error: "Got an unexpected response from the AI — try again." }, { status: 502 });
  }

  if (!parsed || !Array.isArray(parsed.items) || typeof parsed.headline !== "string") {
    console.error("review-vendor: unexpected shape", parsed);
    return NextResponse.json({ error: "Got an unexpected response from the AI — try again." }, { status: 502 });
  }

  return NextResponse.json({
    allClear: !!parsed.allClear,
    headline: parsed.headline,
    caveat: parsed.caveat ?? undefined,
    items: parsed.items.map((it) => ({
      type: it.type === "green" ? "green" : "flag",
      observation: String(it.observation ?? ""),
      question: it.question ? String(it.question) : undefined,
    })),
    reviewedAt: new Date().toISOString(),
  });
}
