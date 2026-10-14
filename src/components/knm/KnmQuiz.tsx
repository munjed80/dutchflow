"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KNM_DRAFT_PREFIX } from "@/lib/knm/storage";
import type { KnmResult, KnmSelection, KnmSubmission, PublicQuestion } from "@/lib/knm/types";
import { useKnm } from "./KnmProvider";
import { KnmScene } from "./KnmScene";
import knmCurriculum from "@/data/knm/curriculum.json";
export function KnmQuiz({ selection, questions, revision, minutes = 0, nextLesson }: { selection: KnmSelection; questions: PublicQuestion[]; revision: string; minutes?: number; nextLesson?: string }) {
  const progress = useKnm();
  const [started, setStarted] = useState(false), [answers, setAnswers] = useState<Record<string, number | null>>({}), [index, setIndex] = useState(0), [flags, setFlags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<number | null>(null), [remaining, setRemaining] = useState(minutes * 60), [result, setResult] = useState<KnmResult | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [saveFailed, setSaveFailed] = useState(false), [assisted, setAssisted] = useState<string[]>([]), [storageWarning, setStorageWarning] = useState("");
  const resultRef = useRef<HTMLDivElement>(null), questionRef = useRef<HTMLHeadingElement>(null), submitted = useRef<KnmSubmission | null>(null), owner = useRef<string | null>(null), previousOwner = useRef<string | null>(null), lock = useRef(false), draftReady = useRef(false), attemptGeneration = useRef(0);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const themeName = (id: string) => knmCurriculum.themes.find((theme) => theme.id === id)?.title.ar ?? id;
  const key = `${KNM_DRAFT_PREFIX}${selection.mode}:${selection.key}`;
  const answered = questions.filter((q) => typeof answers[q.id] === "number").length;
  const expired = Boolean(deadline && remaining <= 0);
  function clearDraft() { try { sessionStorage.removeItem(key); } catch { setStorageWarning("تعذّر مسح مسودة التدريب من هذه الجلسة."); } }
  useEffect(() => {
    if (!progress.ready || draftReady.current) return;
    try {
      const raw = sessionStorage.getItem(key);
      if (minutes && raw) {
        const d = JSON.parse(raw);
        if (d.revision !== revision || d.owner !== progress.userId || !Number.isFinite(d.deadline) || d.deadline > Date.now() + minutes * 60000 || d.deadline < Date.now() - 86400000 || !d.answers || typeof d.answers !== "object" || Array.isArray(d.answers) || Object.entries(d.answers).some(([id, value]) => !questions.some((q) => q.id === id && (value === null || Number.isInteger(value) && Number(value) >= 0 && Number(value) < q.options.length)))) {
          clearDraft(); setStorageWarning("أُهملت مسودة قديمة أو غير صالحة. ابدأ محاولة جديدة.");
        } else {
          setAnswers(d.answers); setDeadline(d.deadline); setRemaining(Math.max(0, Math.ceil((d.deadline - Date.now()) / 1000))); setStarted(true); owner.current = d.owner; previousOwner.current = d.owner;
          if (Number.isInteger(d.index) && d.index >= 0 && d.index < questions.length) setIndex(d.index);
          if (Array.isArray(d.flags)) setFlags(d.flags.filter((id: unknown) => typeof id === "string" && questions.some((q) => q.id === id)));
        }
      }
    } catch { setStorageWarning("مسودة الامتحان غير متاحة. يمكنك التدريب، لكن إعادة تحميل الصفحة قد تبدأ محاولة جديدة."); }
    draftReady.current = true;
  // A route-keyed quiz owns one temporary attempt. Account identity is checked again before saving.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.ready, progress.userId]);
  useEffect(() => {
    if (!progress.ready) return;
    if (previousOwner.current !== progress.userId && started) { attemptGeneration.current++; setStarted(false); setAnswers({}); setResult(null); setDeadline(null); setIndex(0); setFlags([]); setAssisted([]); clearDraft(); setError("تغيّر الحساب. ابدأ محاولة جديدة لحفظ النتيجة في الحساب الحالي."); }
    previousOwner.current = progress.userId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.userId, progress.ready]);
  useEffect(() => { if (!deadline || result) return; const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))); tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer); }, [deadline, result]);
  useEffect(() => {
    if (!minutes || !started || result || !draftReady.current || !progress.ready) return;
    try { sessionStorage.setItem(key, JSON.stringify({ revision, owner: owner.current, answers, index, flags, deadline })); }
    catch { setStorageWarning("لم تُحفظ مسودة الامتحان. إبقاء الصفحة مفتوحة يحافظ على محاولتك الحالية."); }
  }, [answers, index, flags, deadline, minutes, started, result, key, revision, progress.ready]);
  useEffect(() => { if (started && !result) questionRef.current?.focus(); }, [index, started, result]);
  useEffect(() => { if (result) resultRef.current?.focus(); }, [result]);
  function start() { attemptGeneration.current++; clearDraft(); owner.current = progress.userId; previousOwner.current = progress.userId; setStarted(true); setError(""); if (minutes) { setDeadline(Date.now() + minutes * 60000); setRemaining(minutes * 60); } }
  async function submit() {
    if (lock.current) return;
    if (!minutes && answered !== questions.length) { setIndex(questions.findIndex((q) => typeof answers[q.id] !== "number")); setError("أجب عن جميع الأسئلة قبل التحقق. انتقلت إلى أول سؤال متروك."); queueMicrotask(() => questionRef.current?.focus()); return; }
    lock.current = true; setBusy(true); setError("");
    const attempt = attemptGeneration.current;
    const submission: KnmSubmission = { ...selection, revision, answers };
    submitted.current = submission;
    try {
      const response = await fetch("/api/knm/grade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submission) });
      if (!response.ok) throw Error(response.status === 409 ? "revision" : "network");
      const graded: KnmResult = await response.json();
      if (attempt !== attemptGeneration.current) return;
      setResult(graded); clearDraft(); setSaveFailed(!(await progress.save(submission, graded, owner.current)));
    } catch (cause) { setError(cause instanceof Error && cause.message === "revision" ? "تحدّث المحتوى. أعد تحميل الصفحة لبدء محاولة بالنسخة الجديدة." : "تعذّر تصحيح المحاولة. إجاباتك موجودة؛ أعد محاولة التسليم."); }
    finally { lock.current = false; setBusy(false); }
  }
  function restart() { attemptGeneration.current++; clearDraft(); setStarted(false); setResult(null); setAnswers({}); setIndex(0); setFlags([]); setAssisted([]); setDeadline(null); setSaveFailed(false); setFeedbackFilter("all"); setError(""); }
  const q = questions[index];
  return <section className="knm-quiz panel" aria-label="تدريب KNM">
    {storageWarning && <p role="status" className="knm-notice">{storageWarning}</p>}
    {!started ? <><span className="eyebrow">{minutes ? "اختبر معرفتك بالهولندية" : "تحقّق من فهمك"}</span><h2>{minutes ? "قبل أن تبدأ" : selection.mode === "review" ? "تدريب المراجعة" : "تدريب الدرس"}</h2>
      <p>{questions.length} سؤالاً · {minutes ? `${minutes} دقيقة. لن يظهر التصحيح حتى التسليم. الأسئلة المتروكة تُحسب للمراجعة.` : "يمكنك العودة للأسئلة قبل التحقق. شرح عربي اختياري لكل سؤال."}</p>
      {minutes > 0 && <p className="quiet">40 سؤالاً وتوزيعها بالتساوي خيارات تدريبية لـDutchFlow؛ ليست وعداً بعدد أسئلة DUO أو توزيعها. انتهاء الوقت يقفل الإجابات ويتيح تسليم المحاولة.</p>}
      <button className="button button-primary" onClick={start}>ابدأ {minutes ? "الامتحان التدريبي" : selection.mode === "review" ? "مراجعة الأسئلة" : "تدريب الدرس"}</button></>
      : result ? <div ref={resultRef} tabIndex={-1} className="knm-result"><h2>نتيجتك: {result.correct} من {result.total}</h2>
        <p>نتيجة تدريبية وليست نتيجة DUO أو معيار نجاح رسمي. {assisted.length > 0 && `استُخدمت المساعدة العربية في ${assisted.length} أسئلة.`}</p>
        <p role="status">{busy ? "جارٍ حفظ تقدّم KNM…" : saveFailed ? "لم يُحفظ التقدّم بعد." : "حُفظ تقدّم التدريب ومراجعة الأخطاء."}</p>
        {saveFailed && !progress.ready && <button className="button button-secondary" disabled={busy || progress.loading} onClick={() => void progress.refresh()}>أعد تحميل تقدّم KNM</button>}
        {saveFailed && <button disabled={busy || !progress.ready || progress.loading} className="button button-secondary" onClick={async () => { if (!submitted.current) return; setBusy(true); setSaveFailed(!(await progress.save(submitted.current, result, owner.current))); setBusy(false); }}>أعد محاولة الحفظ</button>}
        <div className="knm-score-grid">{result.themes.map((t) => <p key={t.id}>{themeName(t.id)}: {t.correct} / {t.total}</p>)}</div>
        <label className="knm-feedback-filter">عرض التصحيح<select value={feedbackFilter} onChange={(event) => setFeedbackFilter(event.target.value)}><option value="all">جميع الأسئلة ({result.total})</option><option value="mistakes">الأخطاء والمتروك ({result.total - result.correct})</option></select></label>
        {feedbackFilter === "mistakes" && result.correct === result.total && <p role="status">أجبت عن جميع الأسئلة بشكل صحيح. يمكنك عرض جميع الأسئلة لمراجعة الشرح.</p>}
        {result.items.map((item, i) => feedbackFilter === "mistakes" && item.correct ? null : <details className={`knm-feedback ${item.correct ? "is-correct" : "needs-review"}`} key={item.id} open={!item.correct}>
          <summary>{i + 1}. {item.correct ? "إجابة صحيحة" : item.chosen === null ? "سؤال متروك" : "يحتاج مراجعة"}</summary>
          {item.visual && <KnmScene visual={item.visual} />}<h3 lang="nl" dir="ltr">{item.prompt.nl}</h3><p>{item.prompt.ar}</p>
          <p>إجابتك: <span lang="nl" dir="ltr">{item.chosen === null ? "—" : item.options[item.chosen]}</span></p>
          <p>الإجابة الصحيحة: <strong lang="nl" dir="ltr">{item.options[item.correctIndex]}</strong></p>
          <p lang="nl" dir="ltr">{item.explanation.nl}</p><p>{item.explanation.ar}</p>
          <Link className="text-link" href={`/knm/lessons/${item.lessonSlug}`}>راجع الدرس المرتبط ←</Link>
        </details>)}
        <div className="knm-actions"><Link className="button button-primary" href="/knm/review">راجع الأخطاء</Link>{nextLesson && <Link className="button button-secondary" href={`/knm/lessons/${nextLesson}`}>الدرس التالي ←</Link>}<button className="button button-secondary" onClick={restart}>ابدأ محاولة جديدة</button></div>
      </div> : <>
        <div className="knm-quiz-bar"><p role="status">السؤال {index + 1} من {questions.length} · أجبت عن {answered}</p>{minutes > 0 && <p aria-label="الوقت المتبقي" className={expired ? "knm-error" : ""}>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>}</div>
        {expired && <p role="alert">انتهى الوقت. سُلّم محاولتك لعرض التصحيح؛ الأسئلة المتروكة تدخل في المراجعة.</p>}
        <div className="knm-question"><span className="eyebrow">KNM · {themeName(q.themeId)}</span><h2 ref={questionRef} tabIndex={-1} lang="nl" dir="ltr">{q.prompt.nl}</h2>
          {q.visual && <KnmScene visual={q.visual} />}
          <fieldset disabled={busy || expired}><legend className="sr-only">اختر إجابة للسؤال {index + 1}</legend>
            {q.options.map((option, i) => <label className="knm-option" key={i}><input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => { setAnswers((old) => ({ ...old, [q.id]: i })); setError(""); }} /><span lang="nl" dir="ltr">{option}</span></label>)}
          </fieldset>
          {!minutes && <details onToggle={(event) => { if (event.currentTarget.open) setAssisted((old) => [...new Set([...old, q.id])]); }} key={q.id}><summary>اعرض ترجمة السؤال للمساعدة</summary><p>{q.prompt.ar}</p>{q.visual && <p>{q.visual.description.ar}</p>}</details>}
          <button className="knm-flag" disabled={busy} aria-pressed={flags.includes(q.id)} onClick={() => setFlags((old) => old.includes(q.id) ? old.filter((id) => id !== q.id) : [...old, q.id])}>{flags.includes(q.id) ? "أزل علامة المراجعة" : "علّم السؤال للعودة إليه"}</button>
        </div>
        <div className="knm-actions"><button className="button button-secondary" disabled={index === 0 || busy} onClick={() => setIndex(index - 1)}>السابق</button><button className="button button-secondary" disabled={index === questions.length - 1 || busy} onClick={() => setIndex(index + 1)}>التالي</button></div>
        <nav className="knm-question-nav" aria-label="التنقل بين أسئلة KNM">{questions.map((item, i) => <button key={item.id} aria-current={index === i ? "step" : undefined} aria-label={`السؤال ${i + 1}${typeof answers[item.id] === "number" ? "، مجاب" : "، متروك"}${flags.includes(item.id) ? "، معلّم للمراجعة" : ""}`} className={`${typeof answers[item.id] === "number" ? "answered" : ""} ${flags.includes(item.id) ? "flagged" : ""}`} disabled={busy} onClick={() => setIndex(i)}>{i + 1}</button>)}</nav>
        <p className="quiet">الممتلئ: مجاب · الإطار البرتقالي: معلّم للعودة إليه.</p>
        <button disabled={busy} className="button button-primary" onClick={() => { if (minutes && !expired && answered !== questions.length && !window.confirm(`يوجد ${questions.length - answered} سؤالاً متروكاً. هل تريد التسليم؟`)) return; void submit(); }}>{busy ? "جارٍ التصحيح…" : "سلّم المحاولة واعرض النتيجة"}</button>
      </>}
    {error && <p role="alert" className="knm-error">{error}</p>}
  </section>;
}
