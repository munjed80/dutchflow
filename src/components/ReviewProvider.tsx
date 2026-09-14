"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { parseReview, REVIEW_KEY, updateReview } from "@/lib/review";

type ReviewState = { ids: string[]; ready: boolean; error: string; change: (change: { add?: string[]; remove?: string[] }) => boolean; clear: () => boolean; refresh: () => void };
const ReviewContext = createContext<ReviewState | null>(null);

export function ReviewProvider({ allowedIds, children }: { allowedIds: string[]; children: React.ReactNode }) {
  const allowed = useMemo(() => new Set(allowedIds), [allowedIds]);
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(() => {
    try { setIds(parseReview(localStorage.getItem(REVIEW_KEY), allowed)); setError(""); }
    catch { setError("تعذّر قراءة قائمة المراجعة. أعد المحاولة، أو أفرغ القائمة من صفحة المراجعة إذا كانت بياناتها تالفة."); }
    setReady(true);
  }, [allowed]);
  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => { if (event.key === REVIEW_KEY || event.key === null) refresh(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("focus", refresh); };
  }, [refresh]);

  function save(change?: { add?: string[]; remove?: string[] }) {
    if (!ready) return false;
    try {
      // Read the latest persisted list before applying this explicit action.
      const next = change ? updateReview(parseReview(localStorage.getItem(REVIEW_KEY), allowed), change, allowed) : [];
      localStorage.setItem(REVIEW_KEY, JSON.stringify({ version: 1, phraseIds: next }));
      setIds(next); setError(""); return true;
    } catch { setError("تعذّر حفظ قائمة المراجعة. لم يُحفظ التغيير؛ أعد المحاولة أو تحقق من إعدادات التخزين في المتصفح."); return false; }
  }
  return <ReviewContext.Provider value={{ ids, ready, error, change: (change) => save(change), clear: () => save(), refresh }}>{children}</ReviewContext.Provider>;
}

export function useReview() {
  const review = useContext(ReviewContext);
  if (!review) throw new Error("useReview requires ReviewProvider");
  return review;
}
