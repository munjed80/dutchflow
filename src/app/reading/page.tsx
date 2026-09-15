import Link from "next/link";
import { readings } from "@/lib/readings";

export const metadata = { title: "مكتبة القراءة" };

export default function ReadingPage() {
  return <div className="shell inner-page reading-index"><div className="page-heading"><span className="eyebrow">قراءة موجّهة للمبتدئين · مجانية</span><h1>اقرأ الهولندية.<br /><em>وافهم ما حولك.</em></h1><p>رسائل ومواقف يومية مؤلّفة للتعلّم، مع مفردات وقواعد وأسئلة تساعدك على فهم السياق.</p></div>
    <div className="reading-stats"><span>{readings.length} نصوص</span><span>{readings.reduce((sum, reading) => sum + reading.vocabulary.length, 0)} شرحاً للمفردات والتعبيرات</span><span>{readings.reduce((sum, reading) => sum + reading.questions.length, 0)} سؤال فهم</span></div>
    <ol className="reading-grid">{readings.map((reading, index) => <li key={reading.slug}><Link className="panel reading-tile" href={`/reading/${reading.slug}`}><span className="eyebrow">{String(index + 1).padStart(2, "0")} / {reading.topic}</span><h2>{reading.title}</h2><p lang="nl" dir="ltr">{reading.dutchTitle}</p><span className="quiet">{reading.text.split(/\s+/).length} كلمة · {reading.questions.length} أسئلة</span><span className="text-link">اقرأ النص ←</span></Link></li>)}</ol>
    <p className="reading-note">يمكنك الاستعانة بالترجمة والمفردات. اقرأ النص أولاً، ثم استخرج منه ما يجيب عن الأسئلة.</p><Link className="text-link" href="/learn">عد إلى الدروس الأساسية ←</Link>
  </div>;
}
