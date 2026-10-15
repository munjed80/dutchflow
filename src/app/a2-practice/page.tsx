import { getNewcomerPreparation } from "@/lib/a2-newcomers";
import Link from "next/link";
import { practicePacks } from "@/lib/a2-practice";
export const metadata = { title: "تطبيقات وحدات A2" };
export default function A2PracticeIndex() {
  return <div className="shell inner-page"><div className="page-heading"><span className="eyebrow">A2 · تدريب مجاني</span><h1>طبّق ما تعلّمته.</h1><p>قراءة ورسالة مسموعة بتفاصيل مختلفة، ثم كتابة وحوار مع شريك. لا توجد درجة مستوى أو تسجيل للميكروفون.</p></div><section className="panel newcomer-intro"><h2>تطبيقات للقادمين الجدد</h2><p>أربعة مواقف إضافية مع مفردات للتحضير: البلدية والمساعدة الرقمية ومدرسة اللغة والتطوع.</p><Link className="button button-primary" href="/a2-newcomers">اختر موقفاً عملياً ←</Link></section><h2>مراجعات الوحدات والمراجعة الختامية</h2><ol className="scenario-grid">{practicePacks.filter((pack) => !getNewcomerPreparation(pack.slug)).map((pack) => <li className="panel scenario-tile" key={pack.slug}><h2><Link href={`/a2-practice/${pack.slug}`}>{pack.title}</Link></h2></li>)}</ol><Link href="/a2">عد إلى خريطة A2 ←</Link></div>;
}
