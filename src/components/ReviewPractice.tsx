"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildReviewSession, type ReviewPhrase } from "@/lib/review";
import { AudioButton } from "./AudioButton";
import { useReview } from "./ReviewProvider";

function ReviewCard({ phrase, number, total, onAnswer }: { phrase: ReviewPhrase; number: number; total: number; onAnswer: (remembered: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="panel review-card">
    <div className="review-top"><Link href={`/learn/${phrase.lessonSlug}`}>{phrase.lessonTitle}</Link><span>الجملة {number} من {total}</span></div>
    <h2 ref={heading} tabIndex={-1}>كيف تقولها بالهولندية؟</h2><p className="review-prompt">{phrase.arabic}</p>
    {!revealed ? <><p className="quiet">حاول تذكّر الجملة قبل إظهارها.</p><button className="button button-primary" onClick={() => setRevealed(true)}>أظهر الجملة</button></> : <>
      <div className="review-answer"><p lang="nl" dir="ltr">{phrase.dutch}</p><AudioButton id={phrase.id} text={phrase.dutch} /><p className="quiet">{phrase.tip}</p></div>
      <p className="quiet">قيّم تذكّرك قبل إظهار الجملة.</p><div className="review-actions"><button className="button button-primary" onClick={() => onAnswer(true)}>تذكّرتها</button><button className="button button-secondary" onClick={() => onAnswer(false)}>تحتاج مراجعة أخرى</button></div>
    </>}
  </section>;
}

export function ReviewPractice({ phrases }: { phrases: ReviewPhrase[] }) {
  const review = useReview();
  const [session, setSession] = useState<ReviewPhrase[] | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState("");
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const done = session !== null && answers.length === session.length;
  useEffect(() => { if (done) summaryHeading.current?.focus(); }, [done]);
  const saved = review.ids.flatMap((id) => { const phrase = phrases.find((item) => item.id === id); return phrase ? [phrase] : []; });
  const lessonOptions = [...new Map(saved.map((phrase) => [phrase.lessonSlug, phrase.lessonTitle])).entries()];
  // A removed lesson filter must not strand the remaining list.
  const activeFilter = lessonOptions.some(([slug]) => slug === filter) ? filter : "";
  const visible = saved.filter((phrase) => !activeFilter || phrase.lessonSlug === activeFilter);

  function start(items: ReviewPhrase[]) { const next = buildReviewSession(items.map((item) => item.id), phrases); if (next.length) { setSession(next); setAnswers([]); setConfirmClear(false); } }

  return <div className="review-practice">
    <p className="review-note">هذه القائمة خاصة بهذا المتصفح ويشترك فيها من يستخدمه، حتى بعد تسجيل الخروج. لا تُزامن مع حسابك. يمكنك إزالة الجمل أو إفراغ القائمة متى أردت.</p>
    {review.error && <div className="review-error" role="alert"><p>{review.error}</p><button className="review-save-button" onClick={review.refresh}>أعد تحميل القائمة</button></div>}
    {!review.ready ? <p role="status">جارٍ تحميل قائمة المراجعة…</p> : session ? <>
      <div className="writing-progress" role="progressbar" aria-label="جمل جلسة المراجعة" aria-valuenow={answers.length} aria-valuemin={0} aria-valuemax={session.length}><span style={{ width: `${answers.length / session.length * 100}%` }} /></div>
      {done ? <section className="panel review-card"><span className="eyebrow">ملخّص المراجعة</span><h2 ref={summaryHeading} tabIndex={-1}>راجعت {session.length} من الجمل</h2><p className="review-score">تذكّرت {answers.filter(Boolean).length} من {session.length}</p><p>تحتاج {answers.filter((answer) => !answer).length} من الجمل إلى مراجعة أخرى.</p><p className="quiet">هذا تقييمك الذاتي، وليس نتيجة اختبار. لا تتغير قائمة الجمل أو إنجاز الدروس تلقائياً.</p>
        <div className="review-actions">{answers.some((answer) => !answer) && <button className="button button-primary" onClick={() => start(session.filter((_, index) => !answers[index]))}>راجع الجمل الصعبة مجدداً</button>}<button className="button button-secondary" onClick={() => setSession(null)}>عد إلى القائمة</button></div>
      </section> : <ReviewCard key={`${session[answers.length].id}-${answers.length}`} phrase={session[answers.length]} number={answers.length + 1} total={session.length} onAnswer={(remembered) => setAnswers((current) => [...current, remembered])} />}
      {!done && <button className="text-button" onClick={() => setSession(null)}>إنهاء الجلسة والعودة للقائمة</button>}
    </> : <>
      <div className="review-toolbar"><h2>الجمل المحفوظة: {saved.length}</h2>{saved.length > 0 && <><label>اختر الدرس<select value={activeFilter} onChange={(event) => setFilter(event.target.value)}><option value="">كل الدروس</option>{lessonOptions.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}</select></label><button className="button button-primary" disabled={!!review.error} onClick={() => start(visible)}>ابدأ جلسة المراجعة</button></>}</div>
      {saved.length > 0 ? <><p className="quiet">عدد الجمل في الجلسة القادمة: {Math.min(10, visible.length)}، بدءاً من أول القائمة المعروضة. اختر درساً لتراجع جُمَله، وأزل ما لم تعد تحتاجه.</p><ul className="review-list">{visible.map((phrase) => <li className="panel" key={phrase.id}><div><Link className="text-link" href={`/learn/${phrase.lessonSlug}`}>{phrase.lessonTitle}</Link><p lang="nl" dir="ltr">{phrase.dutch}</p><p>{phrase.arabic}</p></div><button className="review-save-button" aria-label={`أزل من المراجعة: ${phrase.dutch}`} onClick={() => review.change({ remove: [phrase.id] })}>أزل من القائمة</button></li>)}</ul></> : !review.error && <div className="panel review-card"><h2>اختر أول جملة للمراجعة</h2><p>اضغط «أضف للمراجعة» بجانب أي جملة في الدروس، أو أضف الجمل التي تحتاج تدريباً من ملخّص الاستماع والكتابة.</p><Link className="button button-primary" href="/learn">تصفّح الدروس ←</Link></div>}
      {(saved.length > 0 || review.error) && <div className="review-clear">{confirmClear ? <><p>هل تريد حذف قائمة الجمل من هذا المتصفح؟ سيبقى إنجاز الدروس كما هو.</p><div className="review-actions"><button className="review-save-button" onClick={() => { if (review.clear()) setConfirmClear(false); }}>نعم، أفرغ القائمة</button><button className="text-button" onClick={() => setConfirmClear(false)}>إلغاء</button></div></> : <button className="text-button" onClick={() => setConfirmClear(true)}>إفراغ قائمة المراجعة</button>}</div>}
    </>}
  </div>;
}
