import Link from "next/link";
import { a2Curriculum } from "@/lib/curriculum";
import { getLesson } from "@/lib/content";
export const metadata = { title: "بداية A2 — أحداث قريبة وروتين يومي" };
export default function A2Page() {
  return <div className="shell inner-page curriculum-page">
    <div className="page-heading"><span className="eyebrow">A2 · الوحدة الأولى متاحة للتجربة</span><h1>احكِ عمّا حدث،<br /><em>وتابع الحوار.</em></h1><p>أربعة دروس تربط أحداث الأمس بروتين اليوم، ثم قراءة واستماع وكتابة وحوار بتفاصيل جديدة.</p></div>
    <p className="reading-note">هذه بداية مسار A2 وليست المستوى كاملاً. التسجيلات الثابتة والمراجعة المستقلة وتجربة المتعلمين ما زالت مطلوبة. يمكنك تجربة المحتوى بحرية؛ إنجاز الدروس ليس شهادة مستوى.</p>
    <nav className="curriculum-index" aria-label="موارد A2"><Link href="/learn?level=A2">دروس A2</Link><Link href="/reading?level=A2">قراءة A2</Link><Link href="/scenarios?level=A2">محادثة A2</Link><Link href="/grammar?level=A2">قواعد A2</Link><Link href="/vocabulary?level=A2">مفردات A2</Link><Link href="/progress?level=A2">تقدّمي في A2</Link></nav>
    {a2Curriculum.map((unit) => <section className="panel curriculum-unit" id={unit.id} key={unit.id}><h2>{unit.title}</h2><ul>{unit.outcomes.map((goal) => <li key={goal}>{goal}</li>)}</ul><ol>{unit.lessonSlugs.map((slug) => <li key={slug}><Link href={`/learn/${slug}`}>{getLesson(slug)!.title} ←</Link></li>)}</ol><Link className="button button-primary" href={`/a2-practice/${unit.id}`}>طبّق المهارات معاً ←</Link></section>)}
    <section className="panel"><h2>هل تحتاج مراجعة قبل البدء؟</h2><p>راجع ترتيب الجملة والحاضر والأسئلة والوقت عند الحاجة. لا يوجد امتحان يقيّد دخولك لهذه الوحدة.</p><Link href="/a1-practice/final-review">المراجعة الختامية لـ A1 ←</Link></section>
  </div>;
}
