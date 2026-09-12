import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";
import { getLesson, lessons } from "@/lib/content";

export function generateStaticParams() { return lessons.map((lesson) => ({ slug: lesson.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `${lesson.title} — ${lesson.level}` : "الدرس غير موجود" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  const nextLesson = lessons[lessons.findIndex((item) => item.slug === lesson.slug) + 1];

  return <div className="shell lesson-page">
    <div className="breadcrumb"><Link href="/learn">كل الدروس</Link><span> / </span><span>{lesson.level}</span><span> / </span><span>{lesson.title}</span></div>
    <div className="lesson-page-heading"><span className="eyebrow">الدرس {lesson.number} · {lesson.level} · {lesson.durationMinutes} دقائق</span><h1>{lesson.title}</h1><p className="lesson-nl" lang="nl" dir="ltr">{lesson.dutchTitle}</p><p>{lesson.description}</p></div>
    <LessonPlayer key={lesson.slug} lesson={lesson} nextLesson={nextLesson} />
  </div>;
}
