import Link from "next/link";
import { curriculum } from "@/lib/curriculum";
import { getLesson, lessons } from "@/lib/content";
import { getReading, readings } from "@/lib/readings";

export const metadata = { title: "خريطة تعلّم A1" };

export default function CurriculumPage() {
  return <div className="shell inner-page curriculum-page">
    <div className="breadcrumb"><Link href="/learn">الدروس</Link><span> / خريطة التعلّم</span></div>
    <div className="page-heading"><span className="eyebrow">منهج A1 قيد الاستكمال</span><h1>اعرف ما تتعلّمه،<br /><em>وما يأتي بعده.</em></h1><p>خريطة من {curriculum.length} محاور تربط أهداف التواصل بالدروس والنصوص المتاحة. اختر ما تحتاجه، ثم عد لتتدرّب في سياق آخر.</p></div>
    <p className="reading-note">المتاح الآن: {lessons.length} درساً و{readings.length} نصوص قراءة. الأهداف تصف ما نعمل على تغطيته؛ وجود درس في المحور أو إكماله لا يعني إتقان مهارات المحور أو مستوى A1 كاملاً.</p>
    <nav className="curriculum-index" aria-label="محاور خريطة التعلّم">{curriculum.map((unit, index) => <a href={`#${unit.id}`} key={unit.id}>{String(index + 1).padStart(2, "0")} · {unit.title}</a>)}</nav>
    <div className="curriculum-units">{curriculum.map((unit, index) => {
      const available = unit.lessonSlugs.length + unit.readingSlugs.length > 0;
      return <section className="panel curriculum-unit" id={unit.id} key={unit.id} aria-labelledby={`${unit.id}-title`}>
        <span className="eyebrow">المحور {String(index + 1).padStart(2, "0")} · {available ? "تغطية جزئية" : "مخطط له"}</span>
        <h2 id={`${unit.id}-title`}>{unit.title}</h2>
        <h3>أهداف هذا المحور</h3><ul>{unit.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        {available && <div className="curriculum-resources"><h3>تدرّب بالمواد المتاحة</h3>
          <ul>{unit.lessonSlugs.map((slug) => <li key={slug}><Link href={`/learn/${slug}`}>درس: {getLesson(slug)!.title} ←</Link></li>)}
          {unit.readingSlugs.map((slug) => <li key={slug}><Link href={`/reading/${slug}`}>قراءة: {getReading(slug)!.title} ←</Link></li>)}</ul>
        </div>}
        <details className="curriculum-remaining"><summary>{available ? "ما الذي سنضيفه لاستكمال التدريب؟" : "ماذا سيشمل هذا المحور؟"}</summary><ul>{unit.remaining.map((gap) => <li key={gap}>{gap}</li>)}</ul></details>
      </section>;
    })}</div>
    <p className="reading-note">للتدرّب على المستوى كاملاً نحتاج إلى القراءة والاستماع والكتابة والتحدث والتفاعل، مع مراجعة لغوية واختبارات على مواقف جديدة. لا تمثل هذه الخريطة شهادة أو نتيجة تحديد مستوى.</p>
    <Link className="text-link" href="/learn">عد إلى جميع الدروس ←</Link>
  </div>;
}
