import { LessonCatalogue } from "@/components/LessonCatalogue";
import Link from "next/link";
import { courseModules, getLessonSummaries, lessons } from "@/lib/content";

export const metadata = { title: "الدروس المجانية" };

export default function LearnPage() {
  return <div className="shell inner-page learning-path-page">
    <div className="page-heading"><span className="eyebrow">مسار A1 · تعلّم مجاناً</span><h1>الهولندية <em>لحياتك اليومية.</em></h1><p>{lessons.length} درساً مجانياً في {courseModules.length} وحدات عملية. اختر درساً وتدرّب بالوتيرة التي تناسبك.</p></div>
    <LessonCatalogue lessons={getLessonSummaries()} modules={courseModules} />
    <div className="continue-banner panel"><div><span className="eyebrow">وسّع لغتك بالقراءة</span><h2>من الجملة إلى النص</h2><p>اقرأ رسائل ومواقف يومية، وتعلّم المفردات والقواعد في سياقها.</p></div><Link className="button button-primary" href="/reading">افتح مكتبة القراءة</Link></div>
    <p className="catalogue-note">هذا مسار تمهيدي ضمن A1. إكمال هذه الدروس لا يعني إتقان المستوى كاملاً. يُحفظ تقدّم الزائر في المتصفح، وتقدّم المستخدم المسجّل في حسابه عند تفعيل الحسابات.</p>
  </div>;
}
