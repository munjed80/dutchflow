import Link from "next/link";
import { newcomerPath } from "@/lib/a2-newcomers";

export const metadata = { title: "A2 للقادمين الجدد — تطبيق اللغة في الحياة اليومية" };
export default function NewcomerPathPage() {
  return <div className="shell inner-page newcomer-page">
    <div className="breadcrumb"><Link href="/a2">مسار A2</Link><span> / مواقف القادمين الجدد</span></div>
    <div className="page-heading"><span className="eyebrow">A2 · تطبيقات مجانية</span><h1>افهم المطلوب،<br /><em>واسأل بثقة.</em></h1><p>اختر موقفاً تحتاجه: رسالة من البلدية، مساعدة رقمية، مدرسة لغة أو تطوع. لكل موقف مفردات للتحضير، وقراءة وتحديث مسموع، ثم كتابة وحوار بأمثلة للمراجعة.</p></div>
    <section className="panel" aria-labelledby="how-to-start"><h2 id="how-to-start">ابدأ بالموقف الذي يهمك</h2><p>لا يلزم ترتيب محدد أو حساب. خصص نحو ٣٥ دقيقة لكل تطبيق، أو قسمه إلى جلستين. حاول أولاً، ثم افتح الترجمة والمثال عند الحاجة. راجع الدروس المقترحة بعد أخطاء الفهم.</p><p>هذه مواقف خيالية لتعلّم اللغة، وليست إجراءات رسمية أو خدمة تابعة لبلدية. لا تدخل بياناتك الحقيقية. إجابات التطبيقات لا تُحفظ ولا تمنح إنجازاً أو شهادة مستوى.</p></section>
    <ol className="scenario-grid newcomer-path">{newcomerPath.map((item, index) => <li className="panel scenario-tile" key={item.slug}>
      <span className="eyebrow">الموقف {index + 1} · نحو {item.minutes} دقيقة</span>
      <h2><Link href={`/a2-practice/${item.slug}`}>{item.title}</Link></h2><p>{item.goal}</p>
      <p className="quiet">٦ مفردات · ٨ أسئلة فهم · مهمتا كتابة · حواران</p>
      <Link className="button button-primary" href={`/a2-practice/${item.slug}`}>ابدأ هذا الموقف ←</Link>
    </li>)}</ol>
    <section className="panel"><h2>تتعلّم مع معلّم أو متطوع؟</h2><p>اختر موقفاً واحداً. اقرأ منفرداً وناقش سبب إجاباتك من النص. في الحوار بدّل الأدوار وغيّر الأسماء والمواعيد، ثم أخبر شريكك بما فهمته وما يحتاج إلى توضيح. يمكن استخدام الأمثلة للمناقشة؛ لا يصح اتخاذها دليلاً على مستوى المتعلم.</p><Link href="/learn?level=A2">ابحث عن درس في A2 ←</Link></section>
  </div>;
}
