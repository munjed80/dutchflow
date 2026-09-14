"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PlacementAnswers, PlacementResult, PublicPlacement } from "@/lib/placement-types";
import { validAnswers } from "@/lib/placement-scoring";

type Phase = "intro" | "questions" | "review" | "result";
type Draft = { revision: string; answers: PlacementAnswers; index: number; review: boolean };
const DRAFT_KEY = "dutchflow-placement-draft-v1";
const limitation = "هذا الاختبار يقترح نقطة بداية داخل مسار A1؛ لا يحدد مستواك الرسمي، ولا يقيس الاستماع أو المحادثة أو الكتابة.";

export function PlacementCheck({ assessment, lessons }: {
  assessment: PublicPlacement; lessons: { slug: string; title: string }[];
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<PlacementAnswers>({});
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const [error, setError] = useState("");
  const [outdated, setOutdated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const busy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answered = Object.keys(answers).length;
  const question = assessment.questions[index];

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const value = JSON.parse(saved);
        if (value && value.revision === assessment.revision && validAnswers(value.answers, assessment, true)
          && Number.isInteger(value.index) && value.index >= 0 && value.index < assessment.questions.length && typeof value.review === "boolean") {
          if (Object.keys(value.answers).length) setDraft(value);
        } else {
          sessionStorage.removeItem(DRAFT_KEY);
          setStorageWarning("تغيّر الاختبار أو تعذّر استعادة الإجابات القديمة. ابدأ محاولة جديدة.");
        }
      }
    } catch { setStorageWarning("تعذّر استعادة إجابات سابقة. يمكنك بدء الاختبار هنا."); }
    setReady(true);
  }, [assessment]);

  useEffect(() => {
    if (!ready || phase === "intro") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ revision: assessment.revision, answers, index, review: phase === "review" || phase === "result" } satisfies Draft));
    } catch { setStorageWarning("تعذّر حفظ إجاباتك في هذا التبويب. أكمل الاختبار دون تحديث الصفحة."); }
  }, [answers, index, phase, ready, assessment.revision]);

  useEffect(() => {
    if (phase !== "intro") heading.current?.focus();
  }, [phase, index]);

  function start(resume = false) {
    setAnswers(resume && draft ? draft.answers : {});
    setIndex(resume && draft ? draft.index : 0);
    setPhase(resume && draft?.review ? "review" : "questions");
    setResult(null); setError(""); setOutdated(false); setDraft(null);
  }

  async function submit() {
    if (busy.current || !validAnswers(answers, assessment)) return;
    busy.current = true; setSubmitting(true); setError("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/placement", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ revision: assessment.revision, answers }),
      });
      if (response.status === 409) {
        setOutdated(true);
        setError("تم تحديث أسئلة الاختبار. حمّل النسخة الجديدة وابدأ من جديد للحصول على نتيجة صحيحة.");
        return;
      }
      if (!response.ok) throw new Error();
      setResult(await response.json()); setPhase("result");
    } catch { setError("تعذّر الحصول على النتيجة. إجاباتك ما زالت هنا؛ تحقّق من الاتصال وأعد المحاولة."); }
    finally { window.clearTimeout(timeout); busy.current = false; setSubmitting(false); }
  }

  return <section className="placement-check" aria-label="اختبار البداية">
    {storageWarning && <p className="placement-note" role="status">{storageWarning}</p>}
    {phase === "intro" && <div className="panel placement-card">
      <span className="eyebrow">من 5 إلى 10 دقائق · بدون حساب</span>
      <h2>16 سؤالاً لاختيار خطوتك التالية</h2>
      <p>أجب بحسب ما تعرفه الآن. إن لم تعرف الإجابة، اختر «لا أعرف» بدلاً من التخمين. يمكنك الرجوع لأي سؤال قبل عرض النتيجة.</p>
      <ul className="placement-facts"><li>مفردات وتعبيرات يومية.</li><li>تركيب جمل هولندية بسيطة.</li><li>فهم مواعيد وتعليمات ورسائل قصيرة.</li></ul>
      <p className="placement-note">{limitation}</p>
      <p className="quiet">نحتفظ بالإجابات في هذا التبويب لتتابع بعد تحديث الصفحة. لا تُضاف النتيجة إلى إنجاز الدروس أو سجل حسابك.</p>
      {draft && <p className="resume-note" role="status">لديك إجابات محفوظة عن {Object.keys(draft.answers).length} من {assessment.questions.length} سؤالاً.</p>}
      <div className="placement-actions">
        {draft && <button className="button button-primary" onClick={() => start(true)}>تابع إجاباتي السابقة</button>}
        <button className={`button ${draft ? "button-secondary" : "button-primary"}`} disabled={!ready} onClick={() => start()}>{draft ? "امسح الإجابات وابدأ من جديد" : "ابدأ الاختبار المجاني"}</button>
      </div>
    </div>}

    {phase === "questions" && <div className="panel placement-card">
      <div className="placement-top"><span className="eyebrow">{assessment.skills.find((skill) => skill.id === question.skill)?.title}</span><span>أجبت عن {answered} من {assessment.questions.length}</span></div>
      <div className="placement-meter" role="progressbar" aria-label="الأسئلة التي أجبت عنها" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={assessment.questions.length}><span style={{ width: `${answered / assessment.questions.length * 100}%` }} /></div>
      <h2 ref={heading} tabIndex={-1}>السؤال {index + 1} من {assessment.questions.length}</h2>
      {question.passage && <blockquote className="placement-passage" lang="nl" dir="ltr">{question.passage}</blockquote>}
      <fieldset className="placement-question" key={question.id}>
        <legend>{question.prompt}</legend>
        <div className="option-list">
          {question.options.map((option, optionIndex) => <label className={`option${answers[question.id] === optionIndex ? " is-selected" : ""}`} key={optionIndex}>
            <input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} />
            <span lang={question.optionLanguage} dir={question.optionLanguage === "nl" ? "ltr" : "rtl"}>{option}</span>
          </label>)}
          <label className={`option unknown-option${answers[question.id] === null ? " is-selected" : ""}`}><input type="radio" name={question.id} checked={answers[question.id] === null} onChange={() => setAnswers((current) => ({ ...current, [question.id]: null }))} /><span>لا أعرف</span></label>
        </div>
      </fieldset>
      <div className="placement-actions">
        <button className="button button-primary" disabled={answers[question.id] === undefined} onClick={() => index === assessment.questions.length - 1 ? setPhase("review") : setIndex(index + 1)}>{index === assessment.questions.length - 1 ? "راجع إجاباتي" : "السؤال التالي"}</button>
        <button className="button button-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>السؤال السابق</button>
        {answered === assessment.questions.length && index < assessment.questions.length - 1 && <button className="button button-secondary" onClick={() => setPhase("review")}>عد إلى المراجعة</button>}
      </div>
    </div>}

    {phase === "review" && <div className="panel placement-card">
      <span className="eyebrow">قبل التصحيح</span><h2 ref={heading} tabIndex={-1}>راجع إجاباتك</h2>
      <p>يمكنك تعديل أي إجابة. اختيار «لا أعرف» يُحسب إجابة غير صحيحة ويساعدنا على اقتراح ما تراجعه.</p>
      <ol className="placement-answer-list">{assessment.questions.map((item, questionIndex) => <li key={item.id}>
        <div><strong>{questionIndex + 1}. {item.prompt}</strong><span lang={typeof answers[item.id] === "number" ? item.optionLanguage : "ar"} dir={typeof answers[item.id] === "number" && item.optionLanguage === "nl" ? "ltr" : "rtl"}>{answers[item.id] === undefined ? "لم تُجب بعد" : answers[item.id] === null ? "لا أعرف" : item.options[answers[item.id]!]}</span></div>
        <button className="button button-secondary" disabled={submitting} onClick={() => { setIndex(questionIndex); setPhase("questions"); setError(""); }} aria-label={`تعديل السؤال ${questionIndex + 1}`}>تعديل</button>
      </li>)}</ol>
      {error && <p role="alert" className="placement-error">{error}</p>}
      <div className="placement-actions">
        {outdated ? <button className="button button-primary" onClick={() => window.location.reload()}>حمّل النسخة الجديدة</button> : <button className="button button-primary" disabled={submitting || answered !== assessment.questions.length} onClick={submit}>{submitting ? "جارٍ تصحيح الإجابات…" : error ? "أعد إرسال الإجابات" : "اعرض نتيجتي"}</button>}
      </div>
      <p className="quiet">الاختبار مجاني، ولا يُكمل دروساً بالنيابة عنك.</p>
    </div>}

    {phase === "result" && result && <div className="placement-results">
      <div className="panel placement-card placement-result-summary">
        <span className="eyebrow">نتيجة هذه المحاولة</span>
        <h2 ref={heading} tabIndex={-1}>{result.guidance.title}</h2>
        <p className="placement-score"><strong>{result.correct}</strong><span>من {result.total} إجابة صحيحة</span></p>
        {result.unknown > 0 && <p className="quiet">اخترت «لا أعرف» في {result.unknown} من الأسئلة.</p>}
        <p>{result.guidance.description}</p><p className="placement-note">{limitation}</p>
      </div>
      <div className="placement-skills">{result.skills.map((skill) => <div className="panel" key={skill.id}><h3>{skill.title}</h3><p><strong>{skill.correct}</strong> من {skill.total}</p></div>)}</div>
      <section className="panel placement-card" aria-labelledby="recommendations-heading"><span className="eyebrow">خطوتك التالية</span><h2 id="recommendations-heading">دروس مقترحة للمراجعة</h2>
        {result.recommendations.length ? <><p>اخترنا حتى ثلاثة دروس مرتبطة بإجاباتك غير الصحيحة.</p><div className="placement-recommendations">{result.recommendations.map((recommendation) => <Link key={recommendation.lessonSlug} href={`/learn/${recommendation.lessonSlug}`}><span>{lessons.find((lesson) => lesson.slug === recommendation.lessonSlug)?.title}</span><span aria-hidden="true">←</span></Link>)}</div></> : <p>لم تظهر أخطاء في هذه العيّنة. اختر موقفاً جديداً من الدروس وطبّق الجمل بصوتك.</p>}
        <Link className="text-link" href="/learn">استكشف جميع الدروس المجانية ←</Link>
      </section>
      <details className="panel placement-card placement-corrections"><summary>راجع الإجابات والتوضيحات</summary>
        <ol>{result.review.map((item, questionIndex) => {
          const original = assessment.questions.find((question) => question.id === item.questionId)!;
          const correct = item.selectedIndex === item.correctIndex;
          return <li key={item.questionId}>
            <span className={correct ? "success-message" : "retry-message"}>{correct ? "إجابة صحيحة" : item.selectedIndex === null ? "اخترت لا أعرف" : "تحتاج إلى مراجعة"}</span>
            <h3>{questionIndex + 1}. {original.prompt}</h3>
            {original.passage && <p lang="nl" dir="ltr" className="placement-passage">{original.passage}</p>}
            <p>إجابتك: <bdi lang={item.selectedIndex === null ? "ar" : original.optionLanguage}>{item.selectedIndex === null ? "لا أعرف" : original.options[item.selectedIndex]}</bdi></p>
            {!correct && <p>الإجابة الصحيحة: <bdi lang={original.optionLanguage}>{original.options[item.correctIndex]}</bdi></p>}
            <p className="quiet">{item.explanation}</p>
          </li>;
        })}</ol>
      </details>
      <div className="placement-actions"><button className="button button-secondary" onClick={() => start()}>ابدأ محاولة جديدة</button><Link className="text-link" href="/exams">الامتحانات التدريبية ←</Link></div>
      <p className="quiet">يمكنك تكرار هذا الاختبار للتدرّب. تكرار الأسئلة قد يرفع نتيجتك بسبب تذكّر الإجابات.</p>
    </div>}
  </section>;
}
