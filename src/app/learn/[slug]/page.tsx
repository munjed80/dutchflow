import { levelHref, curriculumHref, practiceHref } from "@/lib/levels";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";
import { courseModules, getLesson, lessons, getLevelLessons } from "@/lib/content";
import { scenarios } from "@/lib/scenarios";
import { readings } from "@/lib/readings";
import { getCurriculum, lessonExtensions } from "@/lib/curriculum";
import { a2Recycling } from "@/lib/a2-recycling";
import { LessonEnrichment } from "@/components/LessonEnrichment";

export function generateStaticParams() { return lessons.map((lesson) => ({ slug: lesson.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `${lesson.title} — ${lesson.level}` : "الدرس غير موجود" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  const levelLessons = getLevelLessons(lesson.level);
  const curriculum = getCurriculum(lesson.level);
  const index = levelLessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = levelLessons[index - 1];
  const nextLesson = levelLessons[index + 1];
  const module = courseModules.find((item) => item.id === lesson.moduleId);
  const unit = curriculum.find((item) => item.lessonSlugs.includes(lesson.slug));
  const recycling = a2Recycling.filter((set) => set.anchors.some((anchor) => anchor.lessonSlug === lesson.slug));
  const extension = lessonExtensions.find((item) => item.lessonSlug === lesson.slug);

  return <div className={`shell lesson-page${lesson.level === "A2" ? " a2-lesson-page" : ""}`}>
    <div className="breadcrumb"><Link href={levelHref("/learn", lesson.level)}>كل الدروس</Link><span> / </span><span>{lesson.level}</span><span> / </span><span>{lesson.title}</span></div>
    <div className="lesson-page-heading"><span className="eyebrow">{module?.title} · الدرس {lesson.number} من {levelLessons.length} · {lesson.durationMinutes} دقائق</span><h1>{lesson.title}</h1><p className="lesson-nl" lang="nl" dir="ltr">{lesson.dutchTitle}</p><p>{lesson.description}</p></div>
    <nav className="lesson-navigation" aria-label="التنقل بين الدروس">
      {previousLesson ? <Link href={`/learn/${previousLesson.slug}`} rel="prev">→ الدرس السابق: {previousLesson.title}</Link> : <Link href={levelHref("/learn", lesson.level)}>عرض مسار التعلّم</Link>}
      {nextLesson ? <Link href={`/learn/${nextLesson.slug}`} rel="next">الدرس التالي: {nextLesson.title} ←</Link> : <Link href={levelHref("/progress", lesson.level)}>شاهد تقدمك ←</Link>}
    </nav>
    {unit && <p className="curriculum-entry"><Link className="text-link" href={`${curriculumHref(lesson.level)}#${unit.id}`}>هدفك في خريطة {lesson.level}: {unit.title} ←</Link></p>}
    {unit && <p className="curriculum-entry"><Link className="text-link" href={`${practiceHref(lesson.level)}/${unit.id}`}>طبّق مهارات هذا المحور معاً ←</Link></p>}
    <nav className="lesson-contents panel" aria-label="أجزاء هذا الدرس" id="lesson-contents" tabIndex={-1}>
      <strong>في هذا الدرس</strong>
      <div>
        <a href="#phrases-heading">الجمل</a>
        <a href="#dialogue-heading">المحادثة</a>
        <a href="#grammar-heading">القاعدة</a>
        <a href="#quiz-heading">اختبار الدرس</a>
        {extension && <a href="#lesson-vocabulary-heading">المفردات</a>}
        {extension?.languageDepth && <a href="#language-depth-heading">عمّق لغتك</a>}
        {extension && <a href="#lesson-production">التطبيق الحر</a>}
      </div>
    </nav>
    <LessonPlayer key={lesson.slug} lesson={lesson} nextLesson={nextLesson} />
    {extension && <LessonEnrichment lesson={lesson} extension={extension} />}
    {recycling.length > 0 && <section className="reading-related"><h2>استرجع هذا الدرس في سياق جديد</h2><ul>{recycling.map((set) => <li key={set.slug}><Link href={`/a2-recycling/${set.slug}`}>{set.title} ←</Link></li>)}</ul></section>}
    {scenarios.some((scenario) => scenario.sourceLessons.includes(lesson.slug)) && <section className="scenario-links"><h2>استخدم ما تعلّمته في حوار</h2><ul>{scenarios.filter((scenario) => scenario.sourceLessons.includes(lesson.slug)).map((scenario) => <li key={scenario.slug}><Link href={`/scenarios/${scenario.slug}`}>{scenario.title} ←</Link></li>)}</ul></section>}
    {readings.some((reading) => reading.sourceLessons.includes(lesson.slug)) && <section className="reading-related"><h2>وسّع هذا الدرس بالقراءة</h2><div>{readings.filter((reading) => reading.sourceLessons.includes(lesson.slug)).map((reading) => <Link className="text-link" key={reading.slug} href={`/reading/${reading.slug}`}>{reading.title} ←</Link>)}</div></section>}
    <a className="text-link lesson-back-to-contents" href="#lesson-contents">↑ العودة إلى أجزاء الدرس</a>
  </div>;
}
