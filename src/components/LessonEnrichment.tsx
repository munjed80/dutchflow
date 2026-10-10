import Link from "next/link";
import type { Lesson } from "@/lib/content";
import type { LessonExtension } from "@/lib/curriculum";
import { ProductionPractice } from "./ProductionPractice";

export function LessonEnrichment({ lesson, extension }: { lesson: Lesson; extension: LessonExtension }) {
  return <div className="lesson-enrichment">
    <section className="reading-vocabulary" aria-labelledby="lesson-vocabulary-heading">
      <h2 id="lesson-vocabulary-heading">مفردات وصيغ تساعدك على بناء الجملة</h2>
      <p className="quiet">لاحظ أداة الاسم وجمعه، أو تصريف الفعل، ثم اقرأ مثالاً من الدرس.</p>
      <dl>{extension.vocabulary.map((entry) => {
        const phrase = lesson.phrases.find((item) => item.id === entry.phraseId)!;
        return <div className="panel" key={entry.term}>
          <dt lang="nl" dir="ltr">{entry.term}</dt>
          <dd><p>{entry.meaning}</p><p className="vocabulary-forms" lang="nl" dir="ltr">{entry.forms}</p><p lang="nl" dir="ltr">{phrase.dutch}</p><p className="quiet">{phrase.arabic}</p></dd>
        </div>;
      })}</dl>
      <Link className="text-link" href="/vocabulary">استكشف مفردات الدروس الأخرى ←</Link>
    </section>
    {extension.languageDepth && <section className="lesson-language-depth" aria-labelledby="language-depth-heading">
      <div className="section-heading compact-heading">
        <div><span className="eyebrow">عمّق لغتك</span><h2 id="language-depth-heading">استخدم الفكرة بأكثر من طريقة</h2></div>
      </div>
      <div className="panel">
        <h3>أمثلة إضافية في سياقات قريبة</h3>
        <div className="phrase-list">
          {extension.languageDepth.examples.map((example) => <article className="phrase-card language-depth-example" key={example.dutch}>
            <div className="phrase-content">
              <h3 lang="nl" dir="ltr">{example.dutch}</h3>
              <p>{example.arabic}</p>
              <small>{example.note}</small>
            </div>
          </article>)}
        </div>
      </div>
      <div className="panel">
        <h3>تراكيب شائعة</h3>
        <dl>{extension.languageDepth.collocations.map((item) => <div key={item.dutch}>
          <dt lang="nl" dir="ltr">{item.dutch}</dt><dd>{item.arabic}</dd>
        </div>)}</dl>
      </div>
      <div className="panel">
        <h3>قلها بطريقة أخرى</h3>
        {extension.languageDepth.alternatives.map((item) => <div className="language-alternative" key={item.dutch}>
          <p lang="nl" dir="ltr"><strong>{item.dutch}</strong></p>
          <p lang="nl" dir="ltr">→ {item.alternative}</p>
          <p className="quiet">{item.note}</p>
        </div>)}
      </div>
      <div className="panel">
        <h3>أخطاء شائعة يجب تجنبها</h3>
        {extension.languageDepth.commonMistakes.map((item) => <div className="language-mistake" key={item.wrong}>
          <p lang="nl" dir="ltr">✗ {item.wrong}</p>
          <p lang="nl" dir="ltr">✓ {item.correct}</p>
          <p className="quiet">{item.explanation}</p>
        </div>)}
      </div>
    </section>}
    <ProductionPractice key={lesson.slug} tasks={extension.tasks} />
  </div>;
}
