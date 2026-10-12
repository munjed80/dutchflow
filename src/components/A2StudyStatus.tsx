"use client";

import Link from "next/link";
import { useLearning } from "./LearningProvider";
import { getStudyPosition } from "@/lib/study-path";

type UnitSummary = { id: string; title: string; lessons: { slug: string; title: string }[] };
export function A2StudyStatus({ units }: { units: UnitSummary[] }) {
  const learning = useLearning();
  const position = getStudyPosition(units, learning.completedLessons);
  return <section className="panel study-status" aria-labelledby="study-status-heading">
    <h2 id="study-status-heading">خطوتك التالية في A2</h2>
    {learning.loading ? <p role="status">جارٍ تحميل التقدّم… يمكنك تصفح جميع الوحدات أدناه.</p>
      : !learning.ready || learning.error ? <div role="alert"><p>تعذّر التأكد من تقدّمك. يمكنك استخدام جميع الموارد أدناه، ثم إعادة المحاولة لعرض اقتراح يناسب تقدّمك.</p><button className="button button-secondary" onClick={() => void learning.refresh()}>أعد تحميل التقدّم</button></div>
      : <>
        {position.next ? <><p>ابدأ بأول درس لم يُسجّل إكماله. يمكنك اختيار أي مورد دون انتظار هذا الاقتراح.</p><Link className="button button-primary" href={`/learn/${position.next.slug}`}>تابع: {position.next.title} ←</Link></>
          : <><p>أتممت الدروس الأربعين. جرّب الآن نقل ما تعلّمته إلى المراجعة الختامية، ثم ارجع إلى المهارات التي تحتاج تدريبًا. إكمال الدروس ليس شهادة مستوى.</p><Link className="button button-primary" href="/a2-practice/final-review">انتقل إلى المراجعة الختامية ←</Link></>}
        {position.completedUnitIds.length > 0 && <><h3>دروس وحدات أنهيتها — موارد للمراجعة</h3><p className="quiet">هذه القائمة تعكس إكمال الدروس فقط؛ لا نحتفظ بنتائج القراءة والمحادثة والاسترجاع.</p><ul>{units.filter((unit) => position.completedUnitIds.includes(unit.id)).map((unit) => <li key={unit.id}><Link href={`#${unit.id}`}>{unit.title}</Link></li>)}</ul></>}
      </>}
  </section>;
}
