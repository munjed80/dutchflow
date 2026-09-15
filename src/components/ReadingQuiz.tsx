"use client";

import { useEffect, useRef, useState } from "react";
import type { ReadingQuestion } from "@/lib/readings";

export function ReadingQuiz({ questions }: { questions: ReadingQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [missing, setMissing] = useState(false);
  const result = useRef<HTMLHeadingElement>(null);
  const score = questions.filter((question) => answers[question.id] === question.correctIndex).length;
  useEffect(() => { if (checked) result.current?.focus(); }, [checked]);
  function check() {
    const firstMissing = questions.find((question) => answers[question.id] === undefined);
    if (firstMissing) { setMissing(true); document.getElementById(`${firstMissing.id}-0`)?.focus(); return; }
    setMissing(false); setChecked(true);
  }
  return <section className="reading-quiz" aria-labelledby="reading-questions">
    <h2 id="reading-questions">هل فهمت النص؟</h2><p className="quiet">ارجع إلى النص والمفردات عند الحاجة. هذا تدريب مفتوح للمراجعة؛ نتيجته لا تُحفظ ولا تغيّر إنجاز الدروس.</p>
    {questions.map((question, index) => <fieldset className="panel reading-question" key={question.id}><legend>{index + 1}. {question.prompt}</legend><div className="option-list">{question.options.map((option, optionIndex) => <label className={`option${answers[question.id] === optionIndex ? " is-selected" : ""}`} key={option}><input id={`${question.id}-${optionIndex}`} type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setChecked(false); setMissing(false); }} /><span dir="auto">{option}</span></label>)}</div>
      {checked && <div className="reading-feedback"><strong>{answers[question.id] === question.correctIndex ? "إجابة صحيحة." : `الإجابة الصحيحة: ${question.options[question.correctIndex]}`}</strong><p>{question.explanation}</p><span className="eyebrow">الدليل من النص</span><blockquote lang="nl" dir="ltr">{question.evidence}</blockquote></div>}
    </fieldset>)}
    {missing && <p role="alert">اختر إجابة لكل سؤال أولاً.</p>}
    <div className="reading-actions"><button className="button button-primary" onClick={check}>تحقّق من فهمك</button>{checked && <button className="button button-secondary" onClick={() => { setAnswers({}); setChecked(false); setMissing(false); document.getElementById(`${questions[0].id}-0`)?.focus(); }}>أعد أسئلة القراءة</button>}</div>
    {checked && <div className="panel reading-result" role="status"><h3 tabIndex={-1} ref={result}>نتيجة هذه المحاولة: {score} من {questions.length}</h3><p>{score === questions.length ? "أجبت عن الأسئلة كلها بشكل صحيح. راجع جمل الدليل لترسّخ المعنى." : "راجع جمل الدليل والتوضيحات، ثم عدّل إجاباتك وحاول مجدداً."}</p><p className="quiet">هذه نتيجة تدريب على نص واحد، وليست تحديداً لمستواك في اللغة.</p></div>}
  </section>;
}
