"use client";

import { useEffect, useReducer, useRef } from "react";
import { ProductionPractice } from "./ProductionPractice";
import { newScenarioSession, reduceScenario } from "@/lib/scenario-session";
import type { Scenario } from "@/lib/scenario-session";

export function ScenarioPractice({ scenario }: { scenario: Scenario }) {
  const [state, dispatch] = useReducer((current: ReturnType<typeof newScenarioSession>, action: Parameters<typeof reduceScenario>[2]) => reduceScenario(scenario, current, action), undefined, newScenarioSession);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(state.index);
  useEffect(() => {
    if (previousIndex.current !== state.index) heading.current?.focus();
    previousIndex.current = state.index;
  }, [state.index]);
  const turn = scenario.turns[state.index];
  const finished = state.index === scenario.turns.length;
  const resolved = state.history.length > state.index;

  if (finished) return <section className="scenario-summary" aria-labelledby="scenario-step-heading">
    <h2 id="scenario-step-heading" tabIndex={-1} ref={heading}>راجِع الحوار ثم جرّب موقفاً جديداً</h2>
    <p>انتهت الجولات الموجّهة. راجع اختيارك الأول وما احتجت فيه إلى مساعدة، ثم اكتب ردّك الخاص أدناه. هذه مراجعة للتدريب وليست درجة لمستواك.</p>
    <ol className="scenario-recap">{scenario.turns.map((item, index) => {
      const attempt = state.history[index];
      const first = attempt.firstChoice === null ? null : item.choices[attempt.firstChoice];
      const answer = item.choices[item.correctIndex];
      return <li className="panel" key={item.id}>
        <h3>{item.goal}</h3>
        <p className="scenario-outcome">{attempt.usedModel ? "أكملت بمساعدة المثال" : attempt.firstChoice === item.correctIndex ? "رد مناسب من أول محاولة" : "عدّلت الرد بعد المراجعة"}</p>
        <p className="quiet">{scenario.partner}</p><p className="scenario-dutch" lang="nl" dir="ltr">{item.prompt}</p><p>{item.translation}</p>
        {first && attempt.firstChoice !== item.correctIndex && <div className="scenario-first-answer"><strong>اختيارك الأول</strong><p lang="nl" dir="ltr">{first.text}</p><p>{first.translation}</p><p>{first.feedback}</p></div>}
        <strong>الرد المناسب لهذا الموقف</strong><p className="scenario-dutch" lang="nl" dir="ltr">{answer.text}</p><p>{answer.translation}</p><p>{answer.feedback}</p>
        <p className="quiet">رد الطرف الآخر</p><p className="scenario-dutch" lang="nl" dir="ltr">{item.response}</p><p>{item.responseTranslation}</p>
      </li>;
    })}</ol>
    <ProductionPractice tasks={[scenario.transfer]} />
    <button className="button button-secondary" onClick={() => dispatch({ type: "restart" })}>ابدأ الموقف من جديد</button>
  </section>;

  return <section className="scenario-practice" aria-labelledby="scenario-step-heading">
    <div className="scenario-top"><span>الجولة {state.index + 1} من {scenario.turns.length}</span><span>أنت: {scenario.role}</span></div>
    <h2 id="scenario-step-heading" ref={heading} tabIndex={-1}>{turn.goal}</h2>
    {state.index > 0 && <details className="scenario-history" key={`history-${turn.id}`}>
      <summary>راجع الحوار السابق</summary>
      <ol>{scenario.turns.slice(0, state.index).map((item) => <li key={item.id}>
        <p className="quiet">{scenario.partner}</p><p lang="nl" dir="ltr">{item.prompt}</p>
        <p className="quiet">الرد المناسب</p><p lang="nl" dir="ltr">{item.choices[item.correctIndex].text}</p>
        <p className="quiet">رد الطرف الآخر</p><p lang="nl" dir="ltr">{item.response}</p>
      </li>)}</ol>
    </details>}
    <div className="panel scenario-prompt"><span className="eyebrow">{scenario.partner}</span><p className="scenario-dutch" lang="nl" dir="ltr">{turn.prompt}</p>
      <details key={`translation-${turn.id}`}><summary>أظهر معنى كلام الطرف الآخر</summary><p>{turn.translation}</p></details>
    </div>
    <fieldset className="scenario-choices" disabled={resolved}>
      <legend>اختر الرد الأنسب لهدفك في هذه الجولة</legend>
      <div className="option-list">{turn.choices.map((choice, index) => <label className={`option${state.selected === index ? " is-selected" : ""}`} key={`${turn.id}-${index}`}>
        <input type="radio" name={turn.id} value={index} checked={state.selected === index} onChange={() => dispatch({ type: "select", choice: index })} />
        <span lang="nl" dir="ltr">{choice.text}</span>
      </label>)}</div>
    </fieldset>
    <div className="scenario-actions">
      <button className="button button-primary" disabled={state.selected === null || resolved} onClick={() => dispatch({ type: "check" })}>تحقّق من الرد</button>
      {!resolved && <button className="text-button" onClick={() => dispatch({ type: "model" })}>أحتاج مساعدة: أظهر الرد المناسب</button>}
    </div>
    {state.feedback !== null && <div className="scenario-feedback" role="status">
      <strong>{resolved ? (state.history[state.index].usedModel ? "مثال للمساعدة" : "هذا الرد يناسب هدف الموقف") : "راجع هدف الجولة وحاول مجدداً"}</strong>
      <p>{turn.choices[state.feedback].translation}</p><p>{turn.choices[state.feedback].feedback}</p>
      {!resolved && <p>قد تكون الجملة سليمة لغوياً، لكنها لا تحقق المطلوب هنا.</p>}
    </div>}
    {resolved && <div className="panel scenario-response"><span className="eyebrow">رد الطرف الآخر</span><p className="scenario-dutch" lang="nl" dir="ltr">{turn.response}</p><p>{turn.responseTranslation}</p></div>}
    <div className="scenario-actions"><button className="button button-primary" disabled={!resolved} onClick={() => dispatch({ type: "next" })}>{state.index === scenario.turns.length - 1 ? "راجع الحوار وطبّق بنفسك" : "تابع الحوار"}</button></div>
    <p className="quiet">رد الطرف الآخر يظهر بعد اختيار الرد المناسب أو كشف المثال. إجاباتك مؤقتة؛ إعادة التحميل أو الانتقال إلى موقف آخر يبدأ تدريباً جديداً.</p>
  </section>;
}
