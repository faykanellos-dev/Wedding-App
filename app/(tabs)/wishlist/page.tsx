"use client";

import { useEffect, useState, ComponentType } from "react";
import { useAppData } from "@/lib/store";
import { Vendor, VendorReview, WishlistCategory } from "@/lib/types";
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
  IconCheckCircle,
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
  const [reviewingVendor, setReviewingVendor] = useState<Vendor | null>(null);

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pastedLink.trim()) return;
    // Auto-parsing the link to guess a vendor name/category isn't scoped yet
    // (app-spec.md §7) — fall back to asking the user to confirm both.
    setConfirming({ url: pastedLink.trim() });
    setPastedLink("");
  }

  const openCategory = data.wishlistCategories.find((c) => c.id === openCategoryId);
  const reviewingCategory = reviewingVendor
    ? data.wishlistCategories.find((c) => c.id === reviewingVendor.categoryId)
    : undefined;

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
          const locked = cat.locked && !data.isPro;
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

      <button
        onClick={() => setShowProModal(true)}
        className="w-full mt-6 border border-foreground/20 bg-surface rounded-xl p-4 text-left"
      >
        <p className="text-sm font-medium flex items-center gap-1.5">
          <IconSparkle className="w-4 h-4" /> Upgrade to Pro
        </p>
        <p className="text-xs text-muted mt-0.5">Unlimited categories &amp; AI vendor reviews</p>
      </button>

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
          isPro={data.isPro}
          onClose={() => setOpenCategoryId(null)}
          onOpenReview={(v) => setReviewingVendor(v)}
          onRequirePro={() => setShowProModal(true)}
        />
      )}

      {reviewingVendor && reviewingCategory && (
        <VendorReviewModal
          vendor={reviewingVendor}
          categoryName={reviewingCategory.name}
          onClose={() => setReviewingVendor(null)}
        />
      )}

      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
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
  const unlockedCategories = data.wishlistCategories.filter((c) => !c.locked || data.isPro);
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
  isPro,
  onClose,
  onOpenReview,
  onRequirePro,
}: {
  category: WishlistCategory;
  vendors: Vendor[];
  isPro: boolean;
  onClose: () => void;
  onOpenReview: (vendor: Vendor) => void;
  onRequirePro: () => void;
}) {
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
              <li key={v.id} className="bg-surface border border-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-muted truncate">{v.url}</p>
                  </div>
                  {v.reviewStatus && (
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                        v.reviewStatus.allClear ? "bg-border" : "bg-foreground text-background"
                      }`}
                    >
                      {v.reviewStatus.allClear ? (
                        <IconCheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <IconFlag className="w-3.5 h-3.5" />
                      )}
                      {v.reviewStatus.allClear ? "All clear" : "Flagged"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => (isPro ? onOpenReview(v) : onRequirePro())}
                  className="mt-2 text-xs font-medium underline underline-offset-2"
                >
                  {v.reviewStatus ? "View review" : "Run AI review"}
                </button>
              </li>
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

// Step labels shown while a review is in flight (app-spec.md §9, loading
// state) — purely cosmetic pacing, since the real API call is one request.
const LOADING_STEPS = ["Found vendor profile", "Reading reviews and pricing", "Comparing to planning standards"];

function VendorReviewModal({
  vendor,
  categoryName,
  onClose,
}: {
  vendor: Vendor;
  categoryName: string;
  onClose: () => void;
}) {
  const { setVendorReview } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(!vendor.reviewStatus);
  const [result, setResult] = useState<VendorReview | null>(vendor.reviewStatus);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 900);

    let cancelled = false;
    fetch("/api/review-vendor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: vendor.name,
        categoryId: vendor.categoryId,
        categoryName,
        url: vendor.url,
        notes: vendor.notes,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Review failed");
        return json as VendorReview;
      })
      .then((review) => {
        if (cancelled) return;
        setVendorReview(vendor.id, review);
        setResult(review);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearInterval(stepTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, loading]);

  function retry() {
    setResult(null);
    setError(null);
    setStepIndex(0);
    setLoading(true);
    setAttempt((a) => a + 1);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <>
            <p className="text-lg font-medium mb-1">Reviewing {vendor.name}</p>
            <p className="text-xs text-muted mb-5">Checking against your planning standards…</p>
            <ul className="space-y-3">
              {LOADING_STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-2 text-sm">
                  {i < stepIndex ? (
                    <IconCheckCircle className="w-4 h-4 shrink-0" />
                  ) : i === stepIndex ? (
                    <IconSparkle className="w-4 h-4 shrink-0 animate-pulse" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-border inline-block shrink-0" />
                  )}
                  <span className={i <= stepIndex ? "" : "text-muted"}>{step}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading && error && (
          <>
            <p className="text-lg font-medium mb-1">Couldn&apos;t finish this review</p>
            <p className="text-sm text-muted mb-5">{error}</p>
            <button onClick={retry} className="w-full bg-foreground text-background rounded-lg py-2.5 text-sm font-medium mb-2">
              Try again
            </button>
            <button onClick={onClose} className="w-full text-sm text-muted py-1">
              Close
            </button>
          </>
        )}

        {!loading && !error && result && (
          <>
            <p className="text-lg font-medium mb-1">{result.headline}</p>
            {result.caveat && <p className="text-xs text-muted mb-4">{result.caveat}</p>}
            <ul className="space-y-3 my-4">
              {result.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  {item.type === "flag" ? (
                    <IconFlag className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <IconCheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm">{item.observation}</p>
                    {item.question && <p className="text-xs text-muted mt-0.5">Ask: &ldquo;{item.question}&rdquo;</p>}
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={onClose} className="w-full bg-foreground text-background rounded-lg py-2.5 text-sm font-medium">
              {result.allClear ? "Move to shortlist" : "Ask these questions at your next call"}
            </button>
            <button onClick={retry} className="w-full text-xs text-muted py-2 mt-1 underline underline-offset-2">
              Re-run review
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ProModal({ onClose }: { onClose: () => void }) {
  const { setPro } = useAppData();
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-4">Upgrade to Pro</p>
        <ul className="space-y-3 mb-5 text-sm">
          <li className="flex gap-2 items-center"><IconFlag className="w-4 h-4 shrink-0" /> <span>Red/green flag AI vendor reviews</span></li>
          <li className="flex gap-2 items-center"><IconFolder className="w-4 h-4 shrink-0" /> <span>Unlimited wishlist categories</span></li>
          <li className="flex gap-2 items-center"><IconChat className="w-4 h-4 shrink-0" /> <span>Priority support</span></li>
        </ul>
        <p className="text-xs text-muted mb-4">
          Payments aren&apos;t wired up yet — this unlocks Pro on this device so you can try the AI reviews.
        </p>
        <button
          onClick={() => {
            setPro(true);
            onClose();
          }}
          className="w-full bg-foreground text-background rounded-lg py-2.5 text-sm font-medium"
        >
          Upgrade to Pro
        </button>
        <p className="text-center text-xs text-muted mt-2">Cancel anytime</p>
        <button onClick={onClose} className="w-full text-sm text-muted py-2 mt-1">
          Close
        </button>
      </div>
    </div>
  );
}
