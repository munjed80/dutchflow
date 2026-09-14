import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, lessons } from "@/lib/content";
import { buildListeningRounds } from "@/lib/listening";
import { ListeningPractice } from "@/components/ListeningPractice";

export function generateStaticParams() { return lessons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `تدريب الاستماع — ${lesson.title}` : "الدرس غير موجود" };
}
export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  return <div className="shell inner-page listening-page">
    <nav className="breadcrumb" aria-label="مسار الصفحة"><Link href="/learn">كل الدروس</Link><span>/</span><Link href={`/learn/${lesson.slug}`}>{lesson.title}</Link><span>/ الاستماع</span></nav>
    <div className="page-heading"><span className="eyebrow">تدريب مجاني · {lesson.level}</span><h1>اسمع الجملة.<br /><em>وافهم معناها.</em></h1><p>{lesson.title} · {lesson.phrases.length} جمل من الدرس، بالسرعة العادية أو البطيئة.</p></div>
    <ListeningPractice key={lesson.slug} rounds={buildListeningRounds(lesson.phrases)} lessonSlug={lesson.slug} />
  </div>;
}
