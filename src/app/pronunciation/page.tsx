import Link from "next/link";
import drills from "@/data/pronunciation.json";
import { AudioButton } from "@/components/AudioButton";
export const metadata = { title: "الحروف وأصوات الهولندية" };
export default function PronunciationPage() {
  return <div className="shell inner-page"><div className="breadcrumb"><Link href="/learn">الدروس</Link><span> / الحروف والأصوات</span></div>
    <div className="page-heading"><span className="eyebrow">استمع · كرر · قارن</span><h1>الحروف وأصوات<br /><em>الهولندية.</em></h1><p>أمثلة قصيرة للتمييز بين الأصوات وتهجئة الأسماء. استمع ببطء ثم بالنطق الطبيعي، واطلب من شريكك أن يخبرك بما سمعه.</p></div>
    <p className="reading-note">لم تعتمد التسجيلات الثابتة بعد؛ الصوت الحالي قد يأتي من جهازك. أسماء الحروف خصوصاً قد تختلف قراءتها آلياً؛ تُراجع مع معلّم أو تسجيل معتمد. هذه تمارين نطق دون تسجيل صوتك أو تقييم آلي لدقته.</p>
    {drills.map((drill) => <section className="panel grammar-reference" key={drill.id}><h2>{drill.title}</h2><p className="practice-source" lang="nl" dir="ltr">{drill.dutch}</p><AudioButton id={drill.id} text={drill.dutch} timeoutMs={90000} /><p>{drill.explanation}</p><p><strong>جرّب بنفسك: </strong>{drill.task}</p></section>)}
    <Link href="/a1-practice">استخدم الأصوات في مراجعات المحاور ←</Link></div>;
}
