"use client";

import { useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { ReadingQuiz } from "@/components/ReadingQuiz";
import type { QuestionReviewLessons } from "@/lib/practice-review";
import type { PracticePack } from "@/lib/a1-practice";

export function PassageListening({ passage, reviewLessons }: { passage: PracticePack["listening"]; reviewLessons?: QuestionReviewLessons }) {
  const [heard, setHeard] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return <section className="panel passage-listening" aria-labelledby="passage-heading">
    <h2 id="passage-heading">٢. استمع إلى رسالة جديدة</h2>
    <p>استمع حتى النهاية قبل الإجابة. يمكنك التكرار أو اختيار النطق البطيء. الصوت يستخدم تسجيلاً معتمداً إن توفر، وإلا نطق الجهاز الهولندي؛ الجودة والتوفر يعتمدان على الجهاز.</p>
    <AudioButton key={attempt} id={passage.id} text={passage.text} concealText timeoutMs={90000} onPlaybackComplete={() => setHeard(true)} />
    <button className="button button-secondary" onClick={() => setAssisted(true)} disabled={assisted}>اعرض نص المقطع للمساعدة</button>
    <p className="quiet" role="status">{assisted ? "تدريب بمساعدة النص؛ لا يُحسب استماعاً مستقلاً." : heard ? "اكتمل التشغيل. أجب بحسب ما سمعت." : "تُفتح الأسئلة بعد اكتمال التشغيل أو طلب مساعدة النص."}</p>
    {assisted && <div className="passage-transcript"><p lang="nl" dir="ltr">{passage.text}</p><p>{passage.translation}</p></div>}
    {(heard || assisted) && <ReadingQuiz key={attempt} questions={passage.questions} reviewLessons={reviewLessons} retryLabel="أعد أسئلة الاستماع" headingId="listening-questions" title="ماذا فهمت من الرسالة؟" description={assisted ? "راجع الإجابات مع النص. هذه محاولة مساعدة ومؤقتة." : "أجب من الاستماع. عند التحقق تظهر جمل الدليل للمراجعة. لا تُحفظ النتيجة ولا تمنح إتقاناً للمستوى."} onReview={() => setAssisted(true)} />}
    <button className="text-link" onClick={() => { setHeard(false); setAssisted(false); setAttempt((value) => value + 1); }}>ابدأ الاستماع من جديد</button>
  </section>;
}
