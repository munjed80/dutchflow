import Link from "next/link";
import { notFound } from "next/navigation";
import { practicePacks } from "@/lib/a1-practice";
import { ReadingQuiz } from "@/components/ReadingQuiz";
import { PassageListening } from "@/components/PassageListening";
import { ProductionPractice } from "@/components/ProductionPractice";
import { curriculum } from "@/lib/curriculum";

export function generateStaticParams() { return practicePacks.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return { title: practicePacks.find((item) => item.slug === slug)?.title ?? "المراجعة غير موجودة" };
}
export default async function PracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = practicePacks.find((item) => item.slug === slug);
  if (!pack) notFound();
  return <div className="shell inner-page practice-page">
    <div className="breadcrumb"><Link href="/a1-practice">مراجعات A1</Link><span> / {pack.title}</span></div>
    <div className="page-heading"><span className="eyebrow">تدريب مجاني · استخدم بيانات خيالية</span><h1>{pack.title}</h1><p>ابدأ دون النماذج، ثم راجع الفهم والتعبير. لا تُحفظ إجاباتك ولا تتغير علامة إنجاز الدروس.</p></div>
    <nav className="curriculum-index" aria-label="مهارات المراجعة"><a href="#read">القراءة</a><a href="#listen">الاستماع</a><a href="#write">الكتابة</a><a href="#speak">التحدث</a></nav>
    <section id="read"><h2>١. اقرأ معلومات جديدة</h2><div className="panel"><p className="practice-source" lang="nl" dir="ltr">{pack.reading.text}</p>
      {pack.reading.table && <div className="practice-table"><table lang="nl" dir="ltr"><caption>{pack.reading.table.caption}</caption><thead><tr>{pack.reading.table.headers.map((head) => <th scope="col" key={head}>{head}</th>)}</tr></thead><tbody>{pack.reading.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>}
      <details><summary>اعرض ترجمة القراءة</summary><p>{pack.reading.translation}</p></details></div>
      <ReadingQuiz key={`${slug}-reading`} questions={pack.reading.questions} />
    </section>
    <div id="listen"><PassageListening key={slug} passage={pack.listening} /></div>
    <section id="write"><h2>٣. اكتب رسالة جديدة</h2><ProductionPractice key={slug} tasks={[pack.writing]} /></section>
    <section id="speak" className="panel speaking-practice"><h2>٤. تحدث وتبادل الأدوار</h2><p>{pack.speaking.prompt}</p><p className="quiet">تحدث بصوتك مع شريك أو معلّم، ثم بدّلا الأدوار. إذا كنت وحدك، قل الإجابة قبل فتح المثال. لا يُسجّل صوتك ولا يُمنح تقييم للنطق.</p>
      {slug === "travel-and-directions" && <figure className="practice-map"><svg viewBox="0 0 520 320" role="img" aria-labelledby="map-title" aria-describedby="map-desc" lang="nl" style={{ direction: "ltr" }}><title id="map-title">Oefenkaart: van Halte naar School</title><desc id="map-desc">Halte ligt onderaan. Een straat loopt omhoog tot een kruispunt. Links ligt Park, rechts ligt School. Ga vanaf Halte rechtdoor en dan rechtsaf naar School.</desc><path d="M260 270 V100 M70 100 H450" stroke="#c6c9c0" strokeWidth="34" fill="none"/><path d="M260 270 V100 M70 100 H450" stroke="#fff" strokeWidth="2" strokeDasharray="8 8" fill="none"/><circle cx="260" cy="270" r="9" fill="#315b49"/><text x="260" y="307" textAnchor="middle">Halte · start</text><text x="55" y="60">Park</text><text x="400" y="60">School</text><text x="290" y="160">Kruispunt</text><text x="20" y="270">↑ Noord</text></svg><figcaption>خريطة خيالية: ابدأ من المحطة واتجه نحو أعلى الخريطة.</figcaption></figure>}
      <h3>أسئلة الشريك</h3><ul>{pack.speaking.partnerPrompts.map((prompt) => <li key={prompt} lang="nl" dir="ltr">{prompt}</li>)}</ul>
      <details><summary>راجع مثالاً ومعايير الحديث</summary><p lang="nl" dir="ltr">{pack.speaking.model}</p><p>{pack.speaking.translation}</p><ul>{pack.speaking.checklist.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul><p>اطلب من الشريك تحديد معلومة فهمها، ومعلومة تحتاج إلى توضيح. أعد الحديث ببيانات جديدة. هذه مراجعة ذاتية وليست إثباتاً لإتقان المستوى.</p></details>
    </section>
    <section className="panel"><h2>ماذا تراجع بعد المحاولة؟</h2><p>ارجع إلى الدروس المرتبطة بالأخطاء، وجرّب الكتابة والحديث مجدداً بأسماء وأوقات أخرى. لا توجد درجة نجاح موحدة لهذه المراجعة.</p><ul>{pack.unitIds.map((id) => <li key={id}><Link href={`/curriculum#${id}`}>{curriculum.find((unit) => unit.id === id)!.title} ←</Link></li>)}</ul><Link href="/grammar">مرجع القواعد ←</Link></section>
    <Link className="text-link" href="/a1-practice">كل مراجعات A1 ←</Link>
  </div>;
}
