"use client";

import Link from "next/link";
import { useState } from "react";
import { useReview } from "./ReviewProvider";

export function SaveReviewButton({ ids, compact = false }: { ids: string[]; compact?: boolean }) {
  const review = useReview();
  const [attempted, setAttempted] = useState(false);
  const saved = ids.length > 0 && ids.every((id) => review.ids.includes(id));
  if (!ids.length) return null;
  return <div className={`review-save${compact ? " review-save-compact" : ""}`}>
    <button type="button" className="review-save-button" disabled={!review.ready || (saved && !review.error)} onClick={() => { setAttempted(true); review.change({ add: ids }); }}>{saved && !review.error ? "ضمن قائمة المراجعة" : compact ? "أضف للمراجعة" : "أضف هذه الجمل للمراجعة"}</button>
    {!compact && <p className="quiet">تُحفظ معرّفات الجمل فقط في هذا المتصفح، دون إجاباتك أو نتيجتك. <Link className="text-link" href="/review">افتح قائمة المراجعة ←</Link></p>}
    {attempted && review.error && <p className="review-error" role="status">{review.error}</p>}
  </div>;
}
