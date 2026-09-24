import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import { curriculum } from "@/lib/curriculum";

export const metadata = { title: "مواقف حوارية موجّهة" };

export default function ScenariosPage() {
  return <div className="shell inner-page scenario-page">
    <nav className="breadcrumb" aria-label="مسار المواقف"><Link href="/learn">الدروس</Link><span> / المواقف الحوارية</span></nav>
    <div className="page-heading"><span className="eyebrow">تدريب مجاني · مواقف يومية</span><h1>اختر ردّك،<br /><em>وأكمل الحوار.</em></h1><p>{scenarios.length} مواقف تساعدك على استخدام ما تعلّمته في تواصل قصير له هدف واضح.</p></div>
    <p className="reading-note">اقرأ دورك، واختر رداً هولندياً، ثم راجع التوضيح ورد الطرف الآخر. في النهاية اكتب جواباً لموقف مختلف وقارنه بمثال. هذا تدريب نصي باختيارات معدّة مسبقاً؛ لا يقيّم النطق أو المحادثة الحرة، ولا يمنح إنجازاً للدروس.</p>
    <ol className="scenario-grid">{scenarios.map((scenario) => <li key={scenario.slug}><article className="panel scenario-tile">
      <span className="eyebrow">{curriculum.find((unit) => unit.id === scenario.unitId)!.title} · {scenario.turns.length} جولات</span>
      <h2><Link href={`/scenarios/${scenario.slug}`}>{scenario.title}</Link></h2><p className="scenario-dutch" lang="nl" dir="ltr">{scenario.dutchTitle}</p>
      <p>{scenario.mission}</p><Link className="text-link" href={`/scenarios/${scenario.slug}`}>ابدأ الموقف ←</Link>
    </article></li>)}</ol>
  </div>;
}
