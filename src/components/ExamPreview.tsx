"use client";

import { useState } from "react";

const sampleQuestions = [
  { prompt: "ما معنى Uw afspraak is verplaatst؟", options: ["تم إلغاء موعدك", "تم تغيير موعدك", "موعدك غداً"], correct: 1 },
  { prompt: "أي جملة تعني: أريد حجز موعد؟", options: ["Ik wil graag een afspraak maken.", "Ik heb een afspraak gehad.", "Ik ben te laat."], correct: 0 },
  { prompt: "ما معنى Wilt u een bonnetje؟", options: ["هل تريد إيصالاً؟", "هل تريد كيساً؟", "هل تريد بطاقة؟"], correct: 0 },
];

export function ExamPreview() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = sampleQuestions.filter((question, index) => answers[index] === question.correct).length;

  return (
    <section className="exam-preview panel" aria-labelledby="preview-heading">
      <span className="eyebrow">جرّب قبل أن تقرر</span>
      <h2 id="preview-heading">ثلاثة أسئلة تجريبية مجانية</h2>
      <p className="quiet">هذه عيّنة تدريبية قصيرة، وليست امتحاناً رسمياً أو نتيجة معتمدة.</p>
      {sampleQuestions.map((question, questionIndex) => (
        <fieldset className="quiz-question sample-question" key={question.prompt}>
          <legend>{questionIndex + 1}. {question.prompt}</legend>
          <div className="option-list">
            {question.options.map((option, optionIndex) => (
              <label className={`option${answers[questionIndex] === optionIndex ? " is-selected" : ""}`} key={option}>
                <input type="radio" name={`sample-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => {setAnswers((current) => ({...current, [questionIndex]: optionIndex})); setSubmitted(false);}} />
                <span lang={/^[A-Za-z]/.test(option) ? "nl" : undefined} dir={/^[A-Za-z]/.test(option) ? "ltr" : undefined}>{option}</span>
              </label>
            ))}
          </div>
          {submitted && answers[questionIndex] !== question.correct && <p className="quiz-explanation">الإجابة الصحيحة: <strong>{question.options[question.correct]}</strong></p>}
        </fieldset>
      ))}
      <button type="button" className="button button-primary" disabled={Object.keys(answers).length < sampleQuestions.length} onClick={() => setSubmitted(true)}>
        اعرض نتيجتي <span aria-hidden="true">←</span>
      </button>
      {submitted && <p className="sample-result" role="status">نتيجتك: {score} من {sampleQuestions.length}. يمكنك مراجعة الدروس المجانية لتحسينها.</p>}
    </section>
  );
}
