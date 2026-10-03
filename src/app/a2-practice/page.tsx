import Link from "next/link";
import { practicePacks } from "@/lib/a2-practice";
export const metadata = { title: "تطبيقات الوحدة الأولى من A2" };
export default function A2PracticeIndex() {
  return <div className="shell inner-page"><div className="page-heading"><span className="eyebrow">A2 · تدريب مجاني</span><h1>طبّق ما تعلّمته.</h1><p>قراءة ورسالة مسموعة بتفاصيل مختلفة، ثم كتابة وحوار مع شريك. لا توجد درجة مستوى أو تسجيل للميكروفون.</p></div><ol className="scenario-grid">{practicePacks.map((pack) => <li className="panel scenario-tile" key={pack.slug}><h2><Link href={`/a2-practice/${pack.slug}`}>{pack.title}</Link></h2></li>)}</ol><Link href="/a2">عد إلى خريطة A2 ←</Link></div>;
}
