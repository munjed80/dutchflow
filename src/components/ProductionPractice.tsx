"use client";

import { useState } from "react";
import type { ProductionTask } from "@/lib/curriculum";

export function ProductionPractice({ tasks }: { tasks: ProductionTask[] }) {
  const [answers, setAnswers] = useState<string[]>(() => tasks.map(() => ""));
  return <section className="production-practice" aria-labelledby="production-heading">
    <h2 id="production-heading">طبّق في موقف جديد</h2>
    <p>اكتب إجابتك ثم قارنها بالمثال وأسئلة المراجعة. قد تكون هناك صيغ صحيحة أخرى؛ هذا تدريب ذاتي دون درجة أو تصحيح آلي.</p>
    <p className="quiet">استخدم بيانات الموقف الخيالية. إجاباتك مؤقتة وتُمسح عند مغادرة الدرس أو إعادة تحميله.</p>
    {tasks.map((task, index) => <div className="panel production-task" key={task.prompt}>
      <label htmlFor={`production-${index}`}><strong>{index + 1}. {task.prompt}</strong></label>
      {task.cue && <p id={`production-cue-${index}`} className="production-cue" lang="nl" dir="ltr">{task.cue}</p>}
      <textarea id={`production-${index}`} aria-describedby={task.cue ? `production-cue-${index}` : undefined} lang="nl" dir="ltr" maxLength={500} autoComplete="off" spellCheck={false}
        value={answers[index]} onChange={(event) => setAnswers((current) => current.map((value, position) => position === index ? event.target.value : value))} />
      <details>
        <summary>قارن بمثال وراجع إجابتك</summary>
        <p className="production-model" lang="nl" dir="ltr">{task.model}</p>
        <p>{task.translation}</p>
        <ul>{task.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
    </div>)}
  </section>;
}
