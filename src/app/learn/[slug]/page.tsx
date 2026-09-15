import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";
import { courseModules, getLesson, lessons } from "@/lib/content";
import { readings } from "@/lib/readings";
import { curriculum, lessonExtensions } from "@/lib/curriculum";
import { LessonEnrichment } from "@/components/LessonEnrichment";

export function generateStaticParams() { return lessons.map((lesson) => ({ slug: lesson.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `${lesson.title} — ${lesson.level}` : "الدرس غير موجود" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  const index = lessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = lessons[index - 1];
  const nextLesson = lessons[index + 1];
  const module = courseModules.find((item) => item.id === lesson.moduleId);
  const unit = curriculum.find((item) => item.lessonSlugs.includes(lesson.slug));
  const extension = lessonExtensions.find((item) => item.lessonSlug === lesson.slug);

  return <div className="shell lesson-page">
    <div className="breadcrumb"><Link href="/learn">كل الدروس</Link><span> / </span><span>{lesson.level}</span><span> / </span><span>{lesson.title}</span></div>
    <div className="lesson-page-heading"><span className="eyebrow">{module?.title} · الدرس {lesson.number} من {lessons.length} · {lesson.durationMinutes} دقائق</span><h1>{lesson.title}</h1><p className="lesson-nl" lang="nl" dir="ltr">{lesson.dutchTitle}</p><p>{lesson.description}</p></div>
    <nav className="lesson-navigation" aria-label="التنقل بين الدروس">
      {previousLesson ? <Link href={`/learn/${previousLesson.slug}`} rel="prev">→ الدرس السابق: {previousLesson.title}</Link> : <Link href="/learn">عرض مسار التعلّم</Link>}
      {nextLesson ? <Link href={`/learn/${nextLesson.slug}`} rel="next">الدرس التالي: {nextLesson.title} ←</Link> : <Link href="/progress">شاهد تقدمك ←</Link>}
    </nav>
    {unit && <p className="curriculum-entry"><Link className="text-link" href={`/curriculum#${unit.id}`}>هدفك في خريطة A1: {unit.title} ←</Link></p>}
    <LessonPlayer key={lesson.slug} lesson={lesson} nextLesson={nextLesson} />
    {extension && <LessonEnrichment lesson={lesson} extension={extension} />}
    {readings.some((reading) => reading.sourceLessons.includes(lesson.slug)) && <section className="reading-related"><h2>وسّع هذا الدرس بالقراءة</h2><div>{readings.filter((reading) => reading.sourceLessons.includes(lesson.slug)).map((reading) => <Link className="text-link" key={reading.slug} href={`/reading/${reading.slug}`}>{reading.title} ←</Link>)}</div></section>}
  </div>;
}
