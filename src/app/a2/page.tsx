import Link from "next/link";
import { a2Curriculum } from "@/lib/curriculum";
import { getLesson, getLevelLessons } from "@/lib/content";
import { readings } from "@/lib/readings";
import { scenarios } from "@/lib/scenarios";
import { a2Recycling } from "@/lib/a2-recycling";
import { buildStudyPath } from "@/lib/study-path";
import { A2StudyStatus } from "@/components/A2StudyStatus";
export const metadata = { title: "مسار A2 — الهولندية للحياة اليومية" };
export default function A2Page() {
  const path = buildStudyPath(a2Curriculum, getLevelLessons("A2"), readings, scenarios, a2Recycling);
  return <div className="shell inner-page curriculum-page">
    <div className="page-heading"><span className="eyebrow">A2 · الوحدات المتاحة للتجربة</span><h1>احكِ عمّا حدث،<br /><em>وتابع الحوار.</em></h1><p>الدروس المتاحة: {getLevelLessons("A2").length} · الوحدات: {a2Curriculum.length}. احكِ عن أحداث قريبة، وتواصل في العمل والسكن، ثم طبّق في مواقف جديدة: اشرح ما تحتاجه، وافهم التعليمات، وعبّر عن رأيك بأدب.</p></div>
    <p className="reading-note">المسار المؤلف للوحدات الثماني يضم الآن ستة دروس في كل وحدة مع مراجعة تراكمية، لكنه ليس اعتماداً رسمياً لمستوى A2. التسجيلات الثابتة والمراجعة المستقلة وتجربة المتعلمين ما زالت مطلوبة. يمكنك تجربة المحتوى بحرية؛ إنجاز الدروس ليس شهادة مستوى.</p>
    <nav className="curriculum-index" aria-label="موارد A2"><Link href="/learn?level=A2">دروس A2</Link><Link href="/reading?level=A2">قراءة A2</Link><Link href="/scenarios?level=A2">محادثة A2</Link><Link href="/grammar?level=A2">قواعد A2</Link><Link href="/vocabulary?level=A2">مفردات A2</Link><Link href="/a2-recycling">استرجاع وتطبيق</Link><Link href="/progress?level=A2">تقدّمي في A2</Link></nav>
    <A2StudyStatus units={path.map(({ id, title, lessons }) => ({ id, title, lessons }))} />
    <p className="reading-note">مسار مقترح لكل وحدة: ادرس الجمل وتمرّن على الاستماع والكتابة داخل الدروس، ثم اقرأ النص وجرّب الحوار. بعد ذلك اجمع المهارات في التدريب المتكامل، وعد لاحقًا إلى الاسترجاع بين الوحدات. جميع الموارد مفتوحة.</p>
    <div className="curriculum-units">{a2Curriculum.map((unit, index) => {
      const resources = path[index];
      return <section className="panel curriculum-unit" id={unit.id} key={unit.id} aria-labelledby={`${unit.id}-heading`}>
        <span className="eyebrow">الوحدة {index + 1} من {a2Curriculum.length}</span><h2 id={`${unit.id}-heading`}>{unit.title}</h2>
        <ul>{unit.outcomes.map((goal) => <li key={goal}>{goal}</li>)}</ul>
        <h3>١. الدروس والاستماع والكتابة</h3>
        <ol>{unit.lessonSlugs.map((slug) => <li key={slug}><Link href={`/learn/${slug}`}>{getLesson(slug)!.title} ←</Link></li>)}</ol>
        <div className="study-resources">
          <section><h3>٢. اقرأ في سياق جديد</h3><ul>{resources.readings.map((item) => <li key={item.slug}><Link href={`/reading/${item.slug}`}>{item.title} ←</Link></li>)}</ul></section>
          <section><h3>٣. جرّب حوارًا موجّهًا</h3><ul>{resources.scenarios.map((item) => <li key={item.slug}><Link href={`/scenarios/${item.slug}`}>{item.title} ←</Link></li>)}</ul></section>
          <section><h3>٤. اجمع المهارات</h3><p>قراءة واستماع وكتابة وتدريب مع شريك، مع أمثلة للمراجعة الذاتية.</p><Link className="text-link" href={`/a2-practice/${unit.id}`}>طبّق المهارات معاً ←</Link></section>
          <section><h3>٥. استرجع لاحقًا بين الوحدات</h3><p>جرّب هذه المراجعات بعد دراسة الدروس المرتبطة بها في الوحدات الأخرى.</p><ul>{resources.recycling.map((item) => <li key={item.slug}><Link href={`/a2-recycling/${item.slug}`}>{item.title} ←</Link></li>)}</ul></section>
        </div>
      </section>;
    })}</div>
    <section className="panel"><span className="eyebrow">A2 · مراجعة تراكمية</span><h2>طبّق الوحدات الثماني معاً</h2><p>اقرأ خطة عملية، ثم استمع إلى تحديث يغيّر بعض التفاصيل. حدّد المعلومات الحالية، انقلها إلى شخص آخر، ثم تفاوض على خطة نهائية. هذه مراجعة تدريبية وليست اختبار مستوى أو شهادة.</p><Link className="button button-primary" href="/a2-practice/final-review">ابدأ المراجعة الختامية المتكاملة ←</Link></section>
    <section className="panel"><h2>هل تحتاج مراجعة قبل البدء؟</h2><p>راجع ترتيب الجملة والحاضر والأسئلة والوقت عند الحاجة. لا يوجد امتحان يقيّد دخولك لهذا المسار.</p><Link href="/a1-practice/final-review">المراجعة الختامية لـ A1 ←</Link></section>
  </div>;
}
