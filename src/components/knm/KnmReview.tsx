"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useKnm } from "./KnmProvider";
import { KnmQuiz } from "./KnmQuiz";
import type { PublicQuestion } from "@/lib/knm/types";
export function KnmReview() {
  const progress = useKnm(); const [questions, setQuestions] = useState<PublicQuestion[] | null>(null), [revision, setRevision] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const ownerRef = useRef(progress.userId); ownerRef.current = progress.userId;
  useEffect(() => { setQuestions(null); setError(""); }, [progress.userId]);
  async function start() {
    setBusy(true); setError(""); const owner = progress.userId;
    try { const response = await fetch(`/api/knm/review?ids=${encodeURIComponent(progress.wrongQuestionIds.slice(0,20).join(","))}`); if (!response.ok) throw Error(); const data = await response.json(); if (owner !== ownerRef.current) throw Error(); setRevision(data.revision); setQuestions(data.questions); }
    catch { setError("تعذّر تحميل أسئلة المراجعة. أعد المحاولة."); } finally { setBusy(false); }
  }
  if (questions) return <><KnmQuiz key={questions.map((q) => q.id).join(",")} selection={{ mode: "review", key: "mistakes", questionIds: questions.map((q) => q.id) }} questions={questions} revision={revision} /><button className="button button-secondary" onClick={() => setQuestions(null)}>اختر مجموعة مراجعة أخرى</button></>;
  return <section className="panel knm-status">
    {progress.loading ? <p role="status">جارٍ تحميل مراجعة الأخطاء…</p> : !progress.ready ? <><p role="alert">{progress.error}</p><button className="button button-secondary" onClick={() => void progress.refresh()}>أعد تحميل تقدّم KNM</button></> : !progress.wrongQuestionIds.length ? <><h2>لا توجد أسئلة محفوظة للمراجعة</h2><p>تظهر هنا الأسئلة غير الصحيحة أو المتروكة بعد تسليم تدريب. خلو القائمة ليس شهادة إتقان.</p><Link className="button button-primary" href="/knm">اختر درساً ←</Link></> : <><h2>{progress.wrongQuestionIds.length} سؤالاً يحتاج مراجعة</h2><p>تدرّب على مجموعة من 20 سؤالاً كحد أقصى. تُزال الإجابة من المراجعة بعد الإجابة الصحيحة وحفظ التقدّم؛ الدروس المكتملة تبقى مكتملة.</p><button disabled={busy} className="button button-primary" onClick={() => void start()}>{busy ? "جارٍ تحميل الأسئلة…" : "ابدأ مراجعة الأخطاء"}</button></>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
