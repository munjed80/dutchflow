import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";
import { courseModules, getLesson, lessons } from "@/lib/content";

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

  return <div className="shell lesson-page">
    <div className="breadcrumb"><Link href="/learn">كل الدروس</Link><span> / </span><span>{lesson.level}</span><span> / </span><span>{lesson.title}</span></div>
    <div className="lesson-page-heading"><span className="eyebrow">{module?.title} · الدرس {lesson.number} من {lessons.length} · {lesson.durationMinutes} دقائق</span><h1>{lesson.title}</h1><p className="lesson-nl" lang="nl" dir="ltr">{lesson.dutchTitle}</p><p>{lesson.description}</p></div>
    <nav className="lesson-navigation" aria-label="التنقل بين الدروس">
      {previousLesson ? <Link href={`/learn/${previousLesson.slug}`} rel="prev">→ الدرس السابق: {previousLesson.title}</Link> : <Link href="/learn">عرض مسار التعلّم</Link>}
      {nextLesson ? <Link href={`/learn/${nextLesson.slug}`} rel="next">الدرس التالي: {nextLesson.title} ←</Link> : <Link href="/progress">شاهد تقدمك ←</Link>}
    </nav>
    <LessonPlayer key={lesson.slug} lesson={lesson} nextLesson={nextLesson} />
  </div>;
}
