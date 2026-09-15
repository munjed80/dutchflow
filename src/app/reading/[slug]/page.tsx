import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingQuiz } from "@/components/ReadingQuiz";
import { getLesson } from "@/lib/content";
import { getReading, readings } from "@/lib/readings";

export function generateStaticParams() { return readings.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const reading = getReading((await params).slug);
  return { title: reading ? `قراءة — ${reading.title}` : "النص غير موجود" };
}
export default async function ReadingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const reading = getReading((await params).slug);
  if (!reading) notFound();
  const next = readings[readings.indexOf(reading) + 1];
  return <div className="shell inner-page reading-page">
    <nav className="breadcrumb" aria-label="مسار القراءة"><Link href="/learn">الدروس</Link><span>/</span><Link href="/reading">مكتبة القراءة</Link><span>/ {reading.title}</span></nav>
    <div className="page-heading"><span className="eyebrow">{reading.topic} · نص تعليمي مؤلّف</span><h1>{reading.title}</h1><p>اقرأ النص، واستعن بالشرح عند الحاجة، ثم جرّب أسئلة الفهم.</p></div>
    <article className="panel reading-passage" lang="nl" dir="ltr" aria-labelledby="passage-title"><h2 id="passage-title">{reading.dutchTitle}</h2><p>{reading.text}</p></article>
    <details className="panel reading-translation"><summary>أظهر الترجمة العربية</summary><p>{reading.translation}</p></details>
    <section className="reading-vocabulary" aria-labelledby="vocabulary-title"><h2 id="vocabulary-title">مفردات في سياقها</h2><dl>{reading.vocabulary.map((word) => <div className="panel" key={word.term}><dt lang="nl" dir="ltr">{word.term}</dt><dd>{word.meaning}</dd></div>)}</dl></section>
    <section className="panel reading-grammar" aria-labelledby="grammar-title"><span className="eyebrow">قاعدة من النص</span><h2 id="grammar-title">{reading.grammar.title}</h2><p>{reading.grammar.explanation}</p><blockquote lang="nl" dir="ltr">{reading.grammar.example}</blockquote><p className="quiet">{reading.grammar.translation}</p></section>
    <ReadingQuiz key={reading.slug} questions={reading.questions} />
    <section className="reading-related"><h2>دروس تساعدك على التوسّع</h2><div>{reading.sourceLessons.map((slug) => { const lesson = getLesson(slug); return lesson ? <Link className="text-link" key={slug} href={`/learn/${slug}`}>{lesson.title} ←</Link> : null; })}</div></section>
    <Link className="next-lesson" href={next ? `/reading/${next.slug}` : "/reading"}>{next ? `النص التالي: ${next.title}` : "عد إلى مكتبة القراءة"} ←</Link>
  </div>;
}
