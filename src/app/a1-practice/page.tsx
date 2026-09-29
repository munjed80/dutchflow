import Link from "next/link";
import { practicePacks } from "@/lib/a1-practice";

export const metadata = { title: "مراجعات A1 التطبيقية" };
export default function PracticeIndex() {
  return <div className="shell inner-page">
    <div className="breadcrumb"><Link href="/curriculum">خريطة A1</Link><span> / المراجعات التطبيقية</span></div>
    <div className="page-heading"><span className="eyebrow">مجاني · بعد دروس كل محور</span><h1>استخدم ما تعلّمته<br /><em>في مواقف جديدة.</em></h1><p>عشر مراجعات للمحاور ومراجعة ختامية تجمع القراءة والاستماع والكتابة والتحدث مع شريك.</p></div>
    <p className="reading-note">هذه تدريبات وليست امتحانات مدفوعة أو شهادة A1. الإجابات مؤقتة. الكتابة والتحدث لهما نماذج ومعايير مراجعة ذاتية؛ لا يوجد تقييم آلي للنطق أو تسجيل للميكروفون.</p>
    <ol className="scenario-grid">{practicePacks.map((pack, index) => <li key={pack.slug}><article className="panel scenario-tile"><span className="eyebrow">{index < 10 ? `المحور ${index + 1}` : "مراجعة ختامية"}</span><h2><Link href={`/a1-practice/${pack.slug}`}>{pack.title}</Link></h2><p>قراءة جديدة · رسالة مسموعة · كتابة · حديث وتبادل أدوار</p><Link className="text-link" href={`/a1-practice/${pack.slug}`}>ابدأ المراجعة ←</Link></article></li>)}</ol>
    <Link className="text-link" href="/grammar">راجع القواعد حسب المحور ←</Link>
  </div>;
}
