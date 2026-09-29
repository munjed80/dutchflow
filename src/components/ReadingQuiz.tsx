"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReadingQuestion } from "@/lib/readings";
import type { QuestionReviewLessons, ReviewLesson } from "@/lib/practice-review";

type Props = {
  questions: ReadingQuestion[];
  headingId?: string;
  title?: string;
  description?: string;
  reviewLessons?: QuestionReviewLessons;
  retryLabel?: string;
  onReview?: () => void;
};

export function ReadingQuiz({ questions, headingId = "reading-questions", title = "هل فهمت النص؟", description = "ارجع إلى النص والمفردات عند الحاجة. هذا تدريب مفتوح للمراجعة؛ نتيجته لا تُحفظ ولا تغيّر إنجاز الدروس.", reviewLessons = {}, retryLabel = "أعد أسئلة القراءة", onReview }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [missing, setMissing] = useState(false);
  const result = useRef<HTMLHeadingElement>(null);
  const score = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const suggestions = new Map<string, { lesson: ReviewLesson; questionNumbers: number[] }>();
  if (checked) questions.forEach((question, index) => {
    if (answers[question.id] === question.correctIndex) return;
    for (const lesson of reviewLessons[question.id] ?? []) {
      const suggestion = suggestions.get(lesson.slug) ?? { lesson, questionNumbers: [] };
      if (!suggestion.questionNumbers.includes(index + 1)) suggestion.questionNumbers.push(index + 1);
      suggestions.set(lesson.slug, suggestion);
    }
  });
  useEffect(() => { if (checked) result.current?.focus(); }, [checked]);
  function check() {
    const firstMissing = questions.find((question) => answers[question.id] === undefined);
    if (firstMissing) { setMissing(true); document.getElementById(`${firstMissing.id}-0`)?.focus(); return; }
    setMissing(false); setChecked(true);
  }
  return <section className="reading-quiz" aria-labelledby={headingId}>
    <h2 id={headingId}>{title}</h2><p className="quiet">{description}</p>
    {questions.map((question, index) => <fieldset className="panel reading-question" key={question.id}><legend>{index + 1}. {question.prompt}</legend><div className="option-list">{question.options.map((option, optionIndex) => <label className={`option${answers[question.id] === optionIndex ? " is-selected" : ""}`} key={option}><input id={`${question.id}-${optionIndex}`} type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setChecked(false); setMissing(false); if (checked) onReview?.(); }} /><span dir="auto">{option}</span></label>)}</div>
      {checked && <div className="reading-feedback"><strong>{answers[question.id] === question.correctIndex ? "إجابة صحيحة." : `الإجابة الصحيحة: ${question.options[question.correctIndex]}`}</strong><p>{question.explanation}</p><span className="eyebrow">الدليل من النص</span><blockquote lang="nl" dir="ltr">{question.evidence}</blockquote></div>}
    </fieldset>)}
    {missing && <p role="alert">اختر إجابة لكل سؤال أولاً.</p>}
    <div className="reading-actions"><button className="button button-primary" onClick={check}>تحقّق من فهمك</button>{checked && <button className="button button-secondary" onClick={() => { setAnswers({}); setChecked(false); setMissing(false); onReview?.(); document.getElementById(`${questions[0].id}-0`)?.focus(); }}>{retryLabel}</button>}</div>
    {checked && <div className="panel reading-result" role="status"><h3 tabIndex={-1} ref={result}>نتيجة هذه المحاولة: {score} من {questions.length}</h3><p>{score === questions.length ? "أجبت عن الأسئلة كلها بشكل صحيح. راجع جمل الدليل لترسّخ المعنى." : "راجع جمل الدليل والتوضيحات، ثم عدّل إجاباتك وحاول مجدداً."}</p><p className="quiet">هذه نتيجة تدريب على نص واحد، وليست تحديداً لمستواك في اللغة.</p></div>}
    {suggestions.size > 0 && <nav className="panel practice-review" aria-labelledby={`${headingId}-review`}>
      <h3 id={`${headingId}-review`}>دروس مقترحة للمراجعة</h3>
      <p>اختر درساً مرتبطاً بالأسئلة التي أخطأت فيها، وراجع أمثلته ثم تدرّب ببيانات جديدة.</p>
      <ul>{Array.from(suggestions.values()).map(({ lesson, questionNumbers }) => <li key={lesson.slug}>
        <Link href={`/learn/${lesson.slug}`}>{lesson.title} ←</Link>
        <span className="quiet">الأسئلة: {questionNumbers.join("، ")}</span>
      </li>)}</ul>
      <p className="quiet">هذه اقتراحات من إجابات هذه المحاولة فقط. تُمسح المحاولة عند مغادرة الصفحة.</p>
    </nav>}
  </section>;
}
