"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lesson } from "@/lib/content";
import { useLearning } from "./LearningProvider";
import { AudioButton } from "@/components/AudioButton";

export function LessonPlayer({ lesson, nextLesson }: { lesson: Lesson; nextLesson?: Lesson }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const learning = useLearning();
  const completed = learning.completedLessons.includes(lesson.slug);
  const [saveFailed, setSaveFailed] = useState(false);
  const [missingAnswers, setMissingAnswers] = useState(false);

  const correctCount = lesson.questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const passedCurrentAttempt = correctCount === lesson.questions.length;

  async function submitQuiz() {
    if (lesson.questions.some((q) => answers[q.id] === undefined)) {
      setMissingAnswers(true);
      return;
    }
    setMissingAnswers(false);
    setChecked(true);
    if (passedCurrentAttempt) {
      setSaveFailed(!(await learning.save([lesson.slug])));
    }
  }

  return (
    <>
      <div className="lesson-intro panel">
        <div className="eyebrow">الموقف الحقيقي</div>
        <p>{lesson.context}</p>
        <p className="quiet">استمع إلى الجمل، اقرأ معناها، ثم أجب عن الأسئلة.</p>
        <div className="lesson-goal"><strong>هدف الدرس:</strong> {lesson.goal}</div>
      </div>

      <section className="lesson-section" aria-labelledby="phrases-heading">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">01 / استمع واقرأ</span><h2 id="phrases-heading">جمل ستستخدمها فعلاً</h2></div>
          <span className="section-count">{lesson.phrases.length} جمل</span>
        </div>
        <div className="phrase-list">
          {lesson.phrases.map((phrase, index) => (
            <article className="phrase-card" key={phrase.id}>
              <span className="phrase-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="phrase-content">
                <h3 lang="nl" dir="ltr">{phrase.dutch}</h3>
                <p>{phrase.arabic}</p>
                <small>{phrase.tip}</small>
              </div>
              <AudioButton id={phrase.id} text={phrase.dutch} />
            </article>
          ))}
        </div>
        <p className="audio-disclaimer">يستخدم هذا الإصدار نطق جهازك مؤقتاً. عند تجهيز ملفات الدروس الصوتية سيشغّلها الموقع تلقائياً.</p>
      </section>

      <div className="continue-banner panel"><div><span className="eyebrow">استمع دون قراءة الجملة</span><h2>تدرّب على فهم ما تسمعه</h2><p>اختر معنى كل جملة من هذا الدرس، ثم راجع الإجابة.</p></div><Link className="button button-primary" href={`/learn/${lesson.slug}/listening`}>ابدأ تدريب الاستماع</Link></div>
      <section className="lesson-section" aria-labelledby="dialogue-heading">
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">02 / في سياقها</span><h2 id="dialogue-heading">محادثة قصيرة</h2></div>
        </div>
        <div className="dialogue panel">
          {lesson.dialogue.map((turn, index) => {
            const phrase = lesson.phrases.find((item) => item.id === turn.phraseId);
            if (!phrase) return null;
            return (
              <div className="dialogue-turn" key={`${turn.phraseId}-${index}`}>
                <span className="speaker" dir="ltr">{turn.speaker}</span>
                <div><strong lang="nl" dir="ltr">{phrase.dutch}</strong><span>{phrase.arabic}</span></div>
                <AudioButton id={phrase.id} text={phrase.dutch} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="lesson-section" aria-labelledby="quiz-heading">
        <div className="grammar-card panel">
          <span className="eyebrow">03 / قاعدة من الدرس</span>
          <h2>{lesson.grammar.title}</h2>
          <p>{lesson.grammar.explanation}</p>
          <blockquote><p lang="nl" dir="ltr">{lesson.grammar.example}</p><footer>{lesson.grammar.translation}</footer></blockquote>
        </div>
        <div className="section-heading compact-heading">
          <div><span className="eyebrow">04 / طبّق ما تعلمته</span><h2 id="quiz-heading">اختبار الدرس</h2></div>
          <span className="section-count">{lesson.questions.length} أسئلة</span>
        </div>
        <div className="quiz-list">
          {lesson.questions.map((question, questionIndex) => (
            <fieldset className="quiz-question panel" key={question.id}>
              <legend><span className="question-number">{String(questionIndex + 1).padStart(2, "0")}</span> {question.prompt}</legend>
              <div className="option-list">
                {question.options.map((option, index) => {
                  const isSelected = answers[question.id] === index;
                  const statusClass = checked && isSelected
                    ? index === question.correctIndex ? " is-correct" : " is-wrong"
                    : "";
                  return (
                    <label className={`option${isSelected ? " is-selected" : ""}${statusClass}`} key={option}>
                      <input
                        type="radio"
                        name={question.id}
                        value={index}
                        checked={isSelected}
                        onChange={() => {
                          setAnswers((current) => ({ ...current, [question.id]: index }));
                          setChecked(false);
                          setMissingAnswers(false);
                        }}
                      />
                      <span lang={/^[A-Za-z]/.test(option) ? "nl" : undefined} dir={/^[A-Za-z]/.test(option) ? "ltr" : undefined}>{option}</span>
                    </label>
                  );
                })}
              </div>
              {checked && answers[question.id] !== question.correctIndex && <p className="quiz-explanation">{question.explanation}</p>}
            </fieldset>
          ))}
        </div>
        <div className="quiz-footer">
          <button type="button" className="button button-primary" onClick={submitQuiz} disabled={learning.saving}>تحقّق من الإجابات <span aria-hidden="true">←</span></button>
          {missingAnswers && <p role="status">اختر إجابة لكل سؤال أولاً.</p>}
          {checked && <p className={passedCurrentAttempt ? "success-message" : "retry-message"} role="status">
            {passedCurrentAttempt ? "أجبت عن جميع الأسئلة بشكل صحيح. اكتمل الدرس." : `أجبت عن ${correctCount} من ${lesson.questions.length} بشكل صحيح. راجع التوضيحات ثم حاول ثانية.`}
          </p>}
        </div>
        {saveFailed && <div className="panel save-notice" role="alert"><p>{learning.error || "لم يُحفظ التقدّم بعد."}</p><button className="button button-secondary" disabled={learning.saving || learning.loading || !learning.ready} onClick={async () => {
          setSaveFailed(!(await learning.save([lesson.slug])));
        }}>أعد حفظ التقدّم</button> {!learning.ready && <button className="button button-secondary" onClick={() => void learning.refresh()}>أعد تحميل الحساب</button>} <Link href="/account">حسابي</Link></div>}
        {completed && nextLesson && <Link className="next-lesson" href={`/learn/${nextLesson.slug}`}>
          <span>الدرس التالي <strong>{nextLesson.title}</strong></span><span aria-hidden="true">←</span>
        </Link>}
        {completed && !nextLesson && <Link className="next-lesson" href="/progress">شاهد تقدمك وراجع الدروس المتبقية <span aria-hidden="true">←</span></Link>}
      </section>
    </>
  );
}
