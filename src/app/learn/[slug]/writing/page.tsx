import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, lessons } from "@/lib/content";
import { WritingPractice } from "@/components/WritingPractice";

export function generateStaticParams() { return lessons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `تدريب الكتابة — ${lesson.title}` : "الدرس غير موجود" };
}
export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  return <div className="shell inner-page writing-page">
    <nav className="breadcrumb" aria-label="مسار الصفحة"><Link href="/learn">كل الدروس</Link><span>/</span><Link href={`/learn/${lesson.slug}`}>{lesson.title}</Link><span>/ الكتابة</span></nav>
    <div className="page-heading"><span className="eyebrow">تدريب مجاني · {lesson.level}</span><h1>تذكّر الجملة.<br /><em>واكتبها بنفسك.</em></h1><p>{lesson.title} · {lesson.phrases.length} جمل للتدرّب على الكلمات وترتيبها.</p></div>
    <WritingPractice key={lesson.slug} phrases={lesson.phrases} lessonSlug={lesson.slug} />
  </div>;
}
