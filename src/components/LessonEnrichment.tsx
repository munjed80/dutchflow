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
    <ProductionPractice key={lesson.slug} tasks={extension.tasks} />
  </div>;
}
