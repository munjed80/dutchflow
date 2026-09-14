"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Phrase } from "@/lib/content";
import { SaveReviewButton } from "./SaveReviewButton";
import { compareWriting, MAX_WRITING_LENGTH, normalizeWriting, summarizeWriting, type WritingAttempt, type WritingComparison, type WritingToken } from "@/lib/writing";

function WordComparison({ tokens }: { tokens: WritingToken[] }) {
  return <p className="writing-tokens" lang="nl" dir="ltr">{tokens.map((token, index) => <span key={index}>{index > 0 && " "}{token.matched ? token.text : <mark>{token.text}</mark>}</span>)}</p>;
}

function WritingRound({ phrase, number, total, onNext }: { phrase: Phrase; number: number; total: number; onNext: (attempt: WritingAttempt) => void }) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<WritingComparison>();
  const [first, setFirst] = useState<WritingAttempt>();
  const input = useRef<HTMLTextAreaElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  function check(event: FormEvent) {
    event.preventDefault();
    if (result || !normalizeWriting(answer) || answer.length > MAX_WRITING_LENGTH) return;
    const comparison = compareWriting(answer, phrase.dutch);
    setResult(comparison);
    if (!first) setFirst({ phraseId: phrase.id, firstMatches: comparison.matches, assisted: revealed });
  }

  return <section className="panel writing-card" aria-label="تدريب كتابة الجملة">
    <div className="writing-top"><span className="eyebrow">من المعنى إلى الجملة</span><span>الجملة {number} من {total}</span></div>
    <h2 tabIndex={-1} ref={heading}>اكتب صيغة الدرس بالهولندية</h2>
    <p className="writing-prompt">{phrase.arabic}</p>
    <form onSubmit={check}>
      <label className="writing-label" htmlFor="writing-answer">إجابتك بالهولندية</label>
      <textarea id="writing-answer" ref={input} lang="nl" dir="ltr" rows={3} value={answer} maxLength={MAX_WRITING_LENGTH} disabled={Boolean(result)} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="writing-rules writing-length" onChange={(event) => setAnswer(event.target.value)} />
      <p id="writing-length" className="quiet"><bdi dir="ltr">{answer.length} / {MAX_WRITING_LENGTH}</bdi> حرف</p>
      {!result && <div className="writing-actions"><button className="button button-primary" type="submit" disabled={!normalizeWriting(answer)}>قارن مع صيغة الدرس</button>{!revealed && <button className="text-button" type="button" onClick={() => setRevealed(true)}>أظهر صيغة الدرس للمساعدة</button>}</div>}
    </form>
    {revealed && !result && <div className="writing-help" role="status"><p>هذه محاولة بمساعدة النص.</p><p className="writing-model" lang="nl" dir="ltr">{phrase.dutch}</p></div>}
    {result && <div className="writing-feedback" role="status">
      <h3>{result.matches ? "إجابتك تطابق صيغة الدرس." : "إجابتك تختلف عن صيغة الدرس."}</h3>
      {!result.matches && <><p className="quiet">التظليل يوضح كلمات مختلفة أو ناقصة أو بترتيب مختلف. قد توجد صياغات أخرى سليمة؛ هذه مقارنة مع الجملة التي تعلمتها فقط.</p><h4>كلمات إجابتك</h4><WordComparison tokens={result.answer} /><h4>كلمات صيغة الدرس</h4><WordComparison tokens={result.expected} /></>}
      <p className="writing-model" lang="nl" dir="ltr">{phrase.dutch}</p><p>{phrase.tip}</p>
      {first && (!first.firstMatches || first.assisted) && result.matches && <p className="quiet">نجحت في المراجعة. تبقى نتيجة المحاولة الأولى كما هي.</p>}
    </div>}
    {result && first && <div className="writing-actions"><button className="button button-primary" onClick={() => onNext(first)}>{number === total ? "اعرض ملخّص الكتابة" : "الجملة التالية"}</button>{!result.matches && <button className="button button-secondary" onClick={() => { setResult(undefined); setAnswer(""); setRevealed(false); requestAnimationFrame(() => input.current?.focus()); }}>أعد كتابة الجملة</button>}</div>}
  </section>;
}

export function WritingPractice({ phrases, lessonSlug }: { phrases: Phrase[]; lessonSlug: string }) {
  const [attempts, setAttempts] = useState<WritingAttempt[]>([]);
  const [session, setSession] = useState(0);
  const done = attempts.length === phrases.length;
  const summary = summarizeWriting(attempts);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (done) heading.current?.focus(); }, [done]);
  const review = phrases.filter((phrase) => attempts.some((attempt) => attempt.phraseId === phrase.id && (!attempt.firstMatches || attempt.assisted)));
  return <div className="writing-practice">
    <p className="writing-note" id="writing-rules">أعد كتابة جملة الدرس اعتماداً على معناها العربي. نتجاوز اختلاف الحروف الكبيرة والمسافات وعلامات نهاية الجملة، ونقارن الكلمات وترتيبها. يمكنك إظهار الصيغة للمساعدة.</p>
    <div className="writing-progress" role="progressbar" aria-label="الجمل التي كتبتها" aria-valuenow={attempts.length} aria-valuemin={0} aria-valuemax={phrases.length}><span style={{ width: `${attempts.length / phrases.length * 100}%` }} /></div>
    {done ? <section className="panel writing-card writing-summary"><span className="eyebrow">نتيجة المحاولة الأولى</span><h2 ref={heading} tabIndex={-1}>راجعت كتابة جمل الدرس</h2><p className="writing-score">{summary.matches} من {summary.independent} جمل مطابقة دون مساعدة</p><p>أظهرت الصيغة قبل الإجابة في {summary.assisted} من الجمل.</p>
      {summary.independent === 0 && <p>كانت الجولة كلها بمساعدة النص؛ لا توجد نتيجة مستقلة.</p>}
      <SaveReviewButton ids={review.map((phrase) => phrase.id)} />
      <p className="quiet">التصحيح وإعادة الكتابة يساعدانك على التعلّم، ولا يرفعان نتيجة المحاولة الأولى. هذا التدريب لا يقيس مستواك العام، ولا يغيّر إنجاز الدروس. لا تُحفظ الإجابات؛ تحديث الصفحة يبدأ جولة جديدة.</p>
      {review.length > 0 && <details className="writing-review"><summary>جمل للمراجعة ({review.length})</summary><ul>{review.map((phrase) => <li key={phrase.id}><p lang="nl" dir="ltr">{phrase.dutch}</p><p>{phrase.arabic}</p></li>)}</ul></details>}
      <div className="writing-actions"><button className="button button-primary" onClick={() => { setAttempts([]); setSession((current) => current + 1); }}>أعد تدريب الكتابة</button><Link className="text-link" href={`/learn/${lessonSlug}`}>عد إلى الدرس ←</Link></div>
    </section> : <WritingRound key={`${session}-${attempts.length}`} phrase={phrases[attempts.length]} number={attempts.length + 1} total={phrases.length} onNext={(attempt) => setAttempts((current) => [...current, attempt])} />}
  </div>;
}
