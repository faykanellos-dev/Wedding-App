"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";

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
        {data.wishlistCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => (cat.locked ? setShowProModal(true) : setOpenCategoryId(cat.id))}
            className="bg-surface border border-border rounded-xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl" aria-hidden>
                {cat.icon}
              </span>
              {cat.locked ? (
                <span aria-hidden>🔒</span>
              ) : (
                cat.vendorIds.length > 0 && (
                  <span className="text-xs bg-border rounded-full px-1.5 py-0.5">{cat.vendorIds.length}</span>
                )
              )}
            </div>
            <p className="text-sm font-medium">{cat.name}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowProModal(true)}
        className="w-full mt-6 border border-foreground/20 bg-surface rounded-xl p-4 text-left"
      >
        <p className="text-sm font-medium">✨ Upgrade to Pro</p>
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
        <CategoryModal category={openCategory} vendors={data.vendors.filter((v) => v.categoryId === openCategory.id)} onClose={() => setOpenCategoryId(null)} />
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
  const unlockedCategories = data.wishlistCategories.filter((c) => !c.locked);
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
  onClose,
}: {
  category: { id: string; name: string; icon: string };
  vendors: { id: string; name: string; url: string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-4">
          {category.icon} {category.name}
        </p>
        {vendors.length === 0 ? (
          <p className="text-sm text-muted">No vendors saved here yet — paste a link on the Wishlist tab.</p>
        ) : (
          <ul className="space-y-2">
            {vendors.map((v) => (
              <li key={v.id} className="bg-surface border border-border rounded-lg p-3">
                <p className="text-sm font-medium">{v.name}</p>
                <p className="text-xs text-muted truncate">{v.url}</p>
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

function ProModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-lg font-medium mb-4">Upgrade to Pro</p>
        <ul className="space-y-3 mb-5 text-sm">
          <li className="flex gap-2">🚩 <span>Red/green flag AI vendor reviews</span></li>
          <li className="flex gap-2">📁 <span>Unlimited wishlist categories</span></li>
          <li className="flex gap-2">💬 <span>Priority support</span></li>
        </ul>
        <p className="text-xs text-muted mb-4">Coming soon — the Pro tier is planned for after the core app ships.</p>
        <button disabled className="w-full bg-foreground text-background rounded-lg py-2.5 text-sm font-medium opacity-40">
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
