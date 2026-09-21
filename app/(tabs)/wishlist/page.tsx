"use client";

import { useState, ComponentType } from "react";
import { useAppData } from "@/lib/store";
import type { Vendor, VendorReview } from "@/lib/types";
import ProUnlock from "@/components/ProUnlock";
import {
  IconLock,
  IconSparkle,
  IconFlag,
  IconFolder,
  IconChat,
  IconBuilding,
  IconFlower,
  IconCamera,
  IconUtensils,
  IconMusic,
} from "@/lib/icons";

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  venues: IconBuilding,
  flowers: IconFlower,
  "photo-video": IconCamera,
  catering: IconUtensils,
  music: IconMusic,
  other: IconSparkle,
};

export default function WishlistPage() {
  const { data, addVendor } = useAppData();
  const [pastedLink, setPastedLink] = useState("");
  const [confirming, setConfirming] = useState<{ url: string } | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pastedLink.trim()) return;
    // Auto-parsing the link to guess a vendor name/category isn't scoped yet
    // (app-spec.md §7) — fall back to asking the user to confirm both.
    setConfirming({ url: pastedLink.trim() });
    setPastedLink("");
  }

  const openCategory = data.wishlistCategories.find((c) => c.id === openCategoryId);

  return (
    <main className="px-5 pt-8">
      <h1 className="text-xl font-medium mb-4">Wishlist</h1>

      <form onSubmit={handlePasteSubmit} className="flex gap-2 mb-6">
        <input
          value={pastedLink}
          onChange={(e) => setPastedLink(e.target.value)}
          placeholder="Paste a vendor link"
          className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        <button
          type="submit"
          disabled={!pastedLink.trim()}
          className="bg-foreground text-background rounded-lg px-4 text-sm font-medium disabled:opacity-40"
        >
          Save
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {data.wishlistCategories.map((cat) => {
          const locked = cat.locked && !data.proUnlocked;
          return (
            <button
              key={cat.id}
              onClick={() => (locked ? setShowProModal(true) : setOpenCategoryId(cat.id))}
              className="bg-surface border border-border rounded-xl p-4 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                {(() => {
                  const CatIcon = CATEGORY_ICONS[cat.id] ?? IconSparkle;
                  return <CatIcon className="w-5 h-5" />;
                })()}
                {locked ? (
                  <IconLock className="w-4 h-4 text-muted" />
                ) : (
                  cat.vendorIds.length > 0 && (
                    <span className="text-xs bg-border rounded-full px-1.5 py-0.5">{cat.vendorIds.length}</span>
                  )
                )}
              </div>
              <p className="text-sm font-medium">{cat.name}</p>
            </button>
          );
        })}
      </div>

      {!data.proUnlocked && (
        <button
          onClick={() => setShowProModal(true)}
          className="w-full mt-6 border border-foreground/20 bg-surface rounded-xl p-4 text-left"
        >
          <p className="text-sm font-medium flex items-center gap-1.5">
            <IconSparkle className="w-4 h-4" /> Upgrade to Pro
          </p>
          <p className="text-xs text-muted mt-0.5">Unlimited categories &amp; AI vendor reviews</p>
        </button>
      )}

      {confirming && (
        <ConfirmVendorModal
          url={confirming.url}
          onClose={() => setConfirming(null)}
          onSave={(v) => {
            addVendor(v);
            setConfirming(null);
          }}
        />
      )}

      {openCategory && (
        <CategoryModal
          category={openCategory}
          vendors={data.vendors.filter((v) => v.categoryId === openCategory.id)}
          proUnlocked={data.proUnlocked}
          onClose={() => setOpenCategoryId(null)}
          onRequestPro={() => {
            setOpenCategoryId(null);
            setShowProModal(true);
          }}
        />
      )}

      {showProModal && <ProModal proUnlocked={data.proUnlocked} onClose={() => setShowProModal(false)} />}
    </main>
  );
}

function ConfirmVendorModal({
  url,
  onClose,
  onSave,
}: {
  url: string;
  onClose: () => void;
  onSave: (v: { categoryId: string; name: string; url: string; notes: string; reviewStatus: null }) => void;
}) {
  const { data } = useAppData();
  const unlockedCategories = data.wishlistCategories.filter((c) => !c.locked || data.proUnlocked);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(unlockedCategories[0]?.id ?? "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-1">Confirm this vendor</p>
        <p className="text-xs text-muted mb-4 truncate">{url}</p>
        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs text-muted mb-1">Vendor name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="block text-xs text-muted mb-1">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
              {unlockedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <button
            disabled={!name.trim() || !categoryId}
            onClick={() => onSave({ categoryId, name: name.trim(), url, notes: "", reviewStatus: null })}
            className="bg-foreground text-background rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
          >
            Save to wishlist
          </button>
          <button onClick={onClose} className="text-sm text-muted py-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({
  category,
  vendors,
  proUnlocked,
  onClose,
  onRequestPro,
}: {
  category: { id: string; name: string; icon: string };
  vendors: Vendor[];
  proUnlocked: boolean;
  onClose: () => void;
  onRequestPro: () => void;
}) {
  const { updateVendorReview } = useAppData();
  const CatIcon = CATEGORY_ICONS[category.id] ?? IconSparkle;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-4 flex items-center gap-2">
          <CatIcon className="w-5 h-5" /> {category.name}
        </p>
        {vendors.length === 0 ? (
          <p className="text-sm text-muted">No vendors saved here yet — paste a link on the Wishlist tab.</p>
        ) : (
          <ul className="space-y-2">
            {vendors.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                categoryName={category.name}
                proUnlocked={proUnlocked}
                onReviewed={(review) => updateVendorReview(v.id, review)}
                onRequestPro={onRequestPro}
              />
            ))}
          </ul>
        )}
        <button onClick={onClose} className="w-full border border-border rounded-lg py-2.5 text-sm font-medium mt-4">
          Close
        </button>
      </div>
    </div>
  );
}

function VendorCard({
  vendor,
  categoryName,
  proUnlocked,
  onReviewed,
  onRequestPro,
}: {
  vendor: Vendor;
  categoryName: string;
  proUnlocked: boolean;
  onReviewed: (review: VendorReview) => void;
  onRequestPro: () => void;
}) {
  const { recheckPro } = useAppData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const review = vendor.reviewStatus;

  async function runReview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/review-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vendor.name,
          url: vendor.url,
          notes: vendor.notes,
          category: categoryName,
        }),
      });
      const json = await res.json();
      if (res.status === 402) recheckPro(); // server says not Pro (e.g. code revoked) — re-sync the UI
      if (!res.ok) throw new Error(json?.error || "Something went wrong generating the review.");
      onReviewed({
        flag: json.flag,
        headline: json.headline,
        summary: json.summary,
        sources: Array.isArray(json.sources) ? json.sources : [],
        reviewedAt: json.reviewedAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating the review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="bg-surface border border-border rounded-lg p-3">
      <p className="text-sm font-medium">{vendor.name}</p>
      <p className="text-xs text-muted truncate">{vendor.url}</p>

      {review && (
        <div
          className={`mt-2.5 rounded-lg border p-2.5 ${
            review.flag === "green" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-xs font-medium flex items-center gap-1.5 ${
              review.flag === "green" ? "text-green-700" : "text-red-700"
            }`}
          >
            <IconFlag className="w-3.5 h-3.5 shrink-0" />
            {review.flag === "green" ? "Green flag" : "Red flag"} · {review.headline}
          </p>
          <p className="text-xs text-muted mt-1">{review.summary}</p>
          {review.sources.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {review.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted underline underline-offset-2 truncate block"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {proUnlocked ? (
        <button
          onClick={runReview}
          disabled={loading}
          className="mt-2.5 text-xs font-medium border border-border rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          {loading ? "Researching…" : review ? "Re-run AI review" : "Get AI review"}
        </button>
      ) : (
        !review && (
          <button onClick={onRequestPro} className="mt-2.5 text-xs text-muted underline underline-offset-2">
            Upgrade to Pro for AI red/green flag reviews
          </button>
        )
      )}
    </li>
  );
}

function ProModal({ proUnlocked, onClose }: { proUnlocked: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-4">{proUnlocked ? "You're on Pro" : "Upgrade to Pro"}</p>
        <ul className="space-y-3 mb-5 text-sm">
          <li className="flex gap-2 items-center"><IconFlag className="w-4 h-4 shrink-0" /> <span>Red/green flag AI vendor reviews</span></li>
          <li className="flex gap-2 items-center"><IconFolder className="w-4 h-4 shrink-0" /> <span>Unlimited wishlist categories</span></li>
          <li className="flex gap-2 items-center"><IconChat className="w-4 h-4 shrink-0" /> <span>Priority support</span></li>
        </ul>
        {proUnlocked ? (
          <p className="text-xs text-muted mb-4">All Pro features are unlocked on this device.</p>
        ) : (
          <>
            <a
              href="https://theweddingcheatsheet.com/store/p/wedding-cheat-sheet-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-foreground text-background rounded-lg py-2.5 text-sm font-medium mb-3"
            >
              Upgrade to Pro
            </a>
            <div className="text-center mb-1">
              <ProUnlock />
            </div>
          </>
        )}
        <button onClick={onClose} className="w-full text-sm text-muted py-2 mt-3">
          Close
        </button>
      </div>
    </div>
  );
}
