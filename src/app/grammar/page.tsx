import foundations from "@/data/grammar-foundations.json";
import Link from "next/link";
import { curriculum } from "@/lib/curriculum";
import { getLesson } from "@/lib/content";

export const metadata = { title: "مرجع قواعد A1 في سياقها" };
export default function GrammarPage() {
  return <div className="shell inner-page">
    <div className="breadcrumb"><Link href="/learn">الدروس</Link><span> / مرجع القواعد</span></div>
    <p className="curriculum-entry"><Link className="text-link" href="/pronunciation">الحروف وأصوات الهولندية ←</Link></p>
    <div className="page-heading"><span className="eyebrow">قواعد مع أمثلة وتمارين</span><h1>ارجع إلى القاعدة،<br /><em>ثم استخدمها.</em></h1><p>مرجع للقواعد الموجودة في دروسنا، مرتب حسب الموقف. الأمثلة أنماط للمبتدئ وليست وصفاً لكل استثناءات الهولندية.</p></div>
    <nav className="curriculum-index" aria-label="فهرس القواعد">{curriculum.map((unit) => <a key={unit.id} href={`#${unit.id}`}>{unit.title}</a>)}</nav>
    <section aria-labelledby="foundation-heading"><h2 id="foundation-heading">أساسيات تجمع ما تعلمته</h2>{foundations.map((topic) => <article className="panel grammar-foundation" key={topic.title}><h3>{topic.title}</h3><p>{topic.explanation}</p><p className="quiet">على شاشة صغيرة، مرّر الجدول أفقياً لرؤية الأعمدة كلها.</p><div className="practice-table" tabIndex={0} role="region" aria-label={topic.title}><table dir="ltr" lang="nl"><caption lang="ar" dir="rtl">{topic.title}</caption><thead><tr>{topic.headers.map((head) => <th scope="col" key={head} lang="nl">{head}</th>)}</tr></thead><tbody>{topic.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index} dir="auto">{cell}</td>)}</tr>)}</tbody></table></div><ul>{topic.sourceLessons.map((slug) => <li key={slug}><Link href={`/learn/${slug}`}>{getLesson(slug)!.title} ←</Link></li>)}</ul></article>)}</section>
    {curriculum.map((unit) => <section key={unit.id} id={unit.id}><h2>{unit.title}</h2>{unit.lessonSlugs.map((slug) => { const lesson = getLesson(slug)!; return <article className="panel grammar-reference" key={slug}><h3>{lesson.grammar.title}</h3><p>{lesson.grammar.explanation}</p><blockquote lang="nl" dir="ltr">{lesson.grammar.example}</blockquote><p>{lesson.grammar.translation}</p><Link href={`/learn/${slug}`}>تدرّب في درس «{lesson.title}» ←</Link></article>; })}</section>)}
    <Link className="text-link" href="/a1-practice">طبّق في مراجعات A1 ←</Link>
  </div>;
}
