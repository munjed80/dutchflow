"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useKnm } from "./KnmProvider";
import { KnmQuiz } from "./KnmQuiz";
import { knmReviewBatch, knmReviewGroups, knmReviewIds, type KnmReviewLesson } from "@/lib/knm/review";
import type { Bilingual, PublicQuestion } from "@/lib/knm/types";

export function KnmReview({ lessons, themes }: { lessons: KnmReviewLesson[]; themes: { id: string; title: Bilingual }[] }) {
  const progress = useKnm();
  const requested = useSearchParams().get("theme") ?? "all";
  const validTheme = requested === "all" || themes.some((item) => item.id === requested);
  const [theme, setTheme] = useState(validTheme ? requested : "all"), [size, setSize] = useState(10);
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null), [revision, setRevision] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const generation = useRef(0), controller = useRef<AbortController | null>(null);
  const ownerRef = useRef(progress.userId), readyRef = useRef(progress.ready && !progress.loading);
  ownerRef.current = progress.userId; readyRef.current = progress.ready && !progress.loading;
  useEffect(() => { setTheme(validTheme ? requested : "all"); }, [requested, validTheme]);
  useEffect(() => {
    generation.current++; controller.current?.abort(); setQuestions(null); setError(""); setBusy(false);
    return () => { generation.current++; controller.current?.abort(); };
  }, [progress.userId, theme, size]);
  const pending = knmReviewIds(lessons, progress.wrongQuestionIds, theme);
  const groups = knmReviewGroups(lessons, progress.wrongQuestionIds, theme);
  const batch = knmReviewBatch(lessons, progress.wrongQuestionIds, theme, size);
  const themeTitle = theme === "all" ? "جميع المحاور" : themes.find((item) => item.id === theme)?.title.ar;
  async function start() {
    if (busy || !readyRef.current || !batch.length) return;
    const version = ++generation.current, owner = progress.userId;
    controller.current?.abort(); const request = new AbortController(); controller.current = request;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/knm/review?ids=${encodeURIComponent(batch.join(","))}`, { signal: request.signal });
      if (!response.ok) throw Error(); const data = await response.json();
      if (version !== generation.current || owner !== ownerRef.current || !readyRef.current) return;
      setRevision(data.revision); setQuestions(data.questions);
    } catch {
      if (version === generation.current && !request.signal.aborted) setError("تعذّر تحميل أسئلة المراجعة. أعد المحاولة.");
    } finally { if (version === generation.current) setBusy(false); }
  }
  if (questions) return <>
    <p className="knm-notice">جلسة مراجعة: {themeTitle} · {questions.length} سؤالاً. التصحيح يحدّث الأسئلة التي سلّمتها فقط.</p>
    <KnmQuiz key={questions.map((q) => q.id).join(",")} selection={{ mode: "review", key: "mistakes", questionIds: questions.map((q) => q.id) }} questions={questions} revision={revision} />
    <button className="button button-secondary" onClick={() => setQuestions(null)}>اختر مجموعة مراجعة أخرى</button>
  </>;
  return <section className="panel knm-status">
    {progress.loading ? <p role="status">جارٍ تحميل مراجعة الأخطاء…</p> : !progress.ready ? <><p role="alert">{progress.error}</p><button className="button button-secondary" onClick={() => void progress.refresh()}>أعد تحميل تقدّم KNM</button></> : !progress.wrongQuestionIds.length ? <><h2>لا توجد أسئلة محفوظة للمراجعة</h2><p>تظهر هنا الأسئلة غير الصحيحة أو المتروكة بعد تسليم تدريب. خلو القائمة ليس شهادة إتقان.</p><Link className="button button-primary" href="/knm">اختر درساً ←</Link></> : <>
      <h2>{progress.wrongQuestionIds.length} سؤالاً يحتاج مراجعة</h2>
      <p>اختر محوراً وجلسة من 5 أو 10 أو 20 سؤالاً كحد أقصى. تُزال الإجابة بعد تصحيحها وحفظ التقدّم؛ الدروس المكتملة تبقى مكتملة.</p>
      {!validTheme && <p role="status">رابط المحور غير معروف؛ نعرض جميع المحاور.</p>}
      <div className="knm-tools knm-review-tools">
        <div><label htmlFor="knm-review-theme">محور المراجعة</label><select id="knm-review-theme" value={theme} disabled={busy} onChange={(event) => setTheme(event.target.value)}><option value="all">جميع المحاور ({progress.wrongQuestionIds.length})</option>{themes.map((item) => <option key={item.id} value={item.id}>{item.title.ar} ({knmReviewIds(lessons, progress.wrongQuestionIds, item.id).length})</option>)}</select></div>
        <div><label htmlFor="knm-review-size">حجم جلسة المراجعة</label><select id="knm-review-size" value={size} disabled={busy} onChange={(event) => setSize(Number(event.target.value))}>{[5, 10, 20].map((count) => <option key={count} value={count}>{count === 5 ? "جلسة قصيرة · 5 أسئلة" : count === 10 ? "جلسة متوسطة · 10 أسئلة" : "جلسة موسعة · 20 سؤالاً"}</option>)}</select></div>
      </div>
      <p role="status">{pending.length} سؤالاً في الاختيار · {batch.length} في الجلسة التالية</p>
      {pending.length ? <><button disabled={busy} className="button button-primary" onClick={() => void start()}>{busy ? "جارٍ تحميل الأسئلة…" : "ابدأ مراجعة الأخطاء"}</button><h3>الدروس المرتبطة بالأخطاء</h3><ul className="knm-review-lessons">{groups.map((lesson) => <li key={lesson.slug}><Link className="text-link" href={`/knm/lessons/${lesson.slug}`}>{lesson.title.ar} ←</Link><span>{lesson.count} سؤالاً للمراجعة</span></li>)}</ul></> : <><p>لا توجد أخطاء محفوظة في هذا المحور. توجد أسئلة في محاور أخرى؛ خلو المحور لا يعني الإتقان.</p><button className="button button-secondary" onClick={() => setTheme("all")}>اعرض جميع أخطاء KNM</button></>}
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
