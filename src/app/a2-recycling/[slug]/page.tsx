import Link from "next/link";
import { notFound } from "next/navigation";
import { a2Recycling } from "@/lib/a2-recycling";
import { getLesson } from "@/lib/content";
import { ProductionPractice } from "@/components/ProductionPractice";

export function generateStaticParams() { return a2Recycling.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const set = a2Recycling.find((item) => item.slug === slug);
  return { title: set ? `${set.title} — مراجعة A2` : "المراجعة غير موجودة" };
}
export default async function RecyclingSetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = a2Recycling.findIndex((item) => item.slug === slug);
  const set = a2Recycling[index];
  if (!set) notFound();
  const next = a2Recycling[index + 1];
  return <div className="shell inner-page curriculum-page">
    <div className="breadcrumb"><Link href="/a2">مسار A2</Link><span> / </span><Link href="/a2-recycling">استرجاع وتطبيق</Link></div>
    <div className="page-heading"><span className="eyebrow">A2 · مراجعة {index + 1} من {a2Recycling.length}</span><h1>{set.title}</h1><p>{set.goal}</p></div>
    <p className="reading-note">حاول دون الرجوع إلى الدروس أولًا. اكتب إجابتك قبل فتح المثال، ثم قارن المعنى وترتيب الكلمات باستخدام أسئلة المراجعة. الصيغ الصحيحة قد تختلف عن المثال؛ لا تصحيح آلي أو علامة إكمال.</p>
    <ProductionPractice key={set.slug} tasks={set.tasks} />
    <details className="panel recycling-help"><summary>تحتاج مساعدة؟ راجع التراكيب ودروسها</summary><ul>{set.anchors.map((anchor) => <li key={anchor.lessonSlug}>
      <span lang="nl" dir="ltr">{anchor.chunk}</span>{" — "}<Link href={`/learn/${anchor.lessonSlug}`}>{getLesson(anchor.lessonSlug)!.title}</Link>
    </li>)}</ul></details>
    <nav className="lesson-navigation" aria-label="التنقل بين المراجعات">
      <Link href="/a2-recycling">كل مراجعات الاسترجاع</Link>
      {next ? <Link rel="next" href={`/a2-recycling/${next.slug}`}>المراجعة التالية: {next.title} ←</Link> : <Link href="/a2-practice/final-review">المراجعة الختامية المتكاملة ←</Link>}
    </nav>
  </div>;
}
