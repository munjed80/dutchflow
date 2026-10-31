import Link from "next/link";
import { ExamPreview } from "@/components/ExamPreview";

export const metadata = { title: "الامتحانات التدريبية" };

export default function ExamsPage() {
  return <div className="shell inner-page exams-page"><section className="continue-banner panel"><div><span className="eyebrow">KNM · تدريب مجاني</span><h2>استعد لجزء المعرفة بالمجتمع</h2><p>أربعة امتحانات تدريبية مع مؤقّت وتصحيح ومراجعة الأخطاء.</p></div><Link className="button button-primary" href="/knm/exams">افتح امتحانات KNM ←</Link></section><div className="page-heading"><span className="eyebrow">اعرف أين وصلت</span><h1>تدرّب اليوم.<br /><em>اختبر نفسك لاحقاً.</em></h1><p>جرّب الأسئلة المجانية الآن. نعمل حالياً على استكمال الدروس والصوت. نواصل تطوير المزيد من التدريب المتكامل.</p></div>
    <div className="continue-banner panel"><div><span className="eyebrow">متاح الآن · بدون حساب</span><h2>اختبار البداية المجاني</h2><p>16 سؤالاً في المفردات والجمل وفهم النصوص، مع دروس مقترحة للمراجعة.</p></div><Link className="button button-primary" href="/placement">جرّب اختبار البداية</Link></div>
    <div className="exam-layout"><ExamPreview /><aside className="exam-aside"><div className="exam-price-card"><span className="eyebrow">قريباً · A1</span><h2>امتحان تدريبي كامل</h2><p>نعمل على إعداد تدريب شامل يساعدك على تقييم مهاراتك ومراجعة ما تعلمته.</p><span className="coming-soon">قيد الإعداد</span></div><div className="exam-help"><h3>هل تريد التدرّب أولاً؟</h3><p>ابدأ بالدروس المجانية ثم عد لاختبار نفسك.</p><Link href="/learn" className="text-link">انتقل إلى الدروس ←</Link></div></aside></div>
    <p className="legal-note">DutchFlow منصة تعليمية مستقلة. هذه الأسئلة ليست امتحانات Inburgering أو Staatsexamen NT2 رسمية، ولا تمنح شهادة معتمدة.</p>
  </div>;
}
