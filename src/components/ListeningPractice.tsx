"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AudioButton } from "./AudioButton";
import { SaveReviewButton } from "./SaveReviewButton";
import { summarizeListening, type ListeningAttempt, type ListeningRound } from "@/lib/listening";

function Round({ round, number, total, onNext }: { round: ListeningRound; number: number; total: number; onNext: (attempt: ListeningAttempt) => void }) {
  const [heard, setHeard] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [checked, setChecked] = useState(false);
  const correct = selected === round.phrase.id;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="panel listening-card" aria-label="تدريب الجملة">
    <div className="listening-top"><span className="eyebrow">استمع ثم اختر المعنى</span><span>الجملة {number} من {total}</span></div>
    <h2 ref={heading} tabIndex={-1}>ماذا سمعت؟</h2>
    <div className="listening-player"><span className="listening-symbol" aria-hidden="true">◖))</span><AudioButton id={round.phrase.id} text={round.phrase.dutch} concealText onPlaybackComplete={() => setHeard(true)} /></div>
    {!checked && <>
      <p className="quiet">{revealed ? "أظهرت النص؛ ستُسجّل هذه الجملة كتدريب بمساعدة النص." : heard ? "يمكنك اختيار الإجابة أو الاستماع مرة أخرى." : "استمع إلى الجملة كاملة لتفتح الخيارات، أو اعرض النص للتدرّب بالقراءة."}</p>
      {!revealed && <button className="text-button" onClick={() => setRevealed(true)}>اعرض النص للمساعدة</button>}
    </>}
    {(revealed || checked) && <p className="listening-transcript" lang="nl" dir="ltr">{round.phrase.dutch}</p>}
    <fieldset className="listening-choices" disabled={(!heard && !revealed) || checked}><legend>اختر معنى الجملة بالعربية</legend><div className="option-list">
      {round.choices.map((choice) => <label className={`option${selected === choice.id ? " is-selected" : ""}`} key={choice.id}><input type="radio" name={`listen-${round.phrase.id}`} checked={selected === choice.id} onChange={() => setSelected(choice.id)} /><span>{choice.text}</span></label>)}
    </div></fieldset>
    {checked && <div className="listening-feedback" role="status"><strong className={correct ? "success-message" : "retry-message"}>{correct ? "إجابة صحيحة." : "راجع المعنى ثم استمع مرة أخرى."}</strong><p>المعنى: {round.phrase.arabic}</p><p className="quiet">{round.phrase.tip}</p></div>}
    <div className="listening-actions">{checked ? <button className="button button-primary" onClick={() => onNext({ phraseId: round.phrase.id, correct, assisted: revealed })}>{number === total ? "اعرض ملخّص التدريب" : "الجملة التالية"}</button> : <button className="button button-primary" disabled={!selected || (!heard && !revealed)} onClick={() => setChecked(true)}>تحقّق من المعنى</button>}</div>
  </section>;
}

export function ListeningPractice({ rounds, lessonSlug }: { rounds: ListeningRound[]; lessonSlug: string }) {
  const [attempts, setAttempts] = useState<ListeningAttempt[]>([]);
  const [session, setSession] = useState(0);
  const done = attempts.length === rounds.length;
  const summary = summarizeListening(attempts);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (done) heading.current?.focus(); }, [done]);
  return <div className="listening-practice">
    <p className="listening-note">يستخدم الموقع ملفات الدرس عند توفرها، وإلا يستخدم صوتاً هولندياً من جهازك. جودة الصوت وتوفره يختلفان بين الأجهزة.</p>
    <div className="listening-progress" role="progressbar" aria-label="الجمل التي تدرّبت عليها" aria-valuenow={attempts.length} aria-valuemin={0} aria-valuemax={rounds.length}><span style={{ width: `${attempts.length / rounds.length * 100}%` }} /></div>
    {done ? <section className="panel listening-card listening-summary"><span className="eyebrow">ملخّص هذه الجولة</span><h2 ref={heading} tabIndex={-1}>خطوة أخرى في فهم الهولندية</h2>
      <p className="listening-score"><strong>{summary.correct}</strong> من {summary.listening} إجابات صحيحة بعد الاستماع دون إظهار النص</p>
      <p>تدرّبت على {summary.assisted} من الجمل بمساعدة النص.</p>
      {!summary.listening && <p className="quiet">كانت هذه الجولة بمساعدة النص بالكامل؛ لا توجد نتيجة استماع مستقلة.</p>}
      <SaveReviewButton ids={attempts.filter((attempt) => !attempt.correct || attempt.assisted).map((attempt) => attempt.phraseId)} />
      <p className="quiet">هذا تدريب على جمل تعرفها من الدرس، وليس قياساً لمستواك. لا يغيّر إنجاز الدروس ولا يُحفظ في حسابك. أعد الجولة لمراجعة الأخطاء.</p>
      <div className="listening-actions"><button className="button button-primary" onClick={() => { setAttempts([]); setSession(session + 1); }}>أعد التدريب</button><Link className="text-link" href={`/learn/${lessonSlug}`}>عد إلى الدرس ←</Link></div>
    </section> : <Round key={`${session}-${attempts.length}`} round={rounds[attempts.length]} number={attempts.length + 1} total={rounds.length} onNext={(attempt) => setAttempts((current) => [...current, attempt])} />}
  </div>;
}
