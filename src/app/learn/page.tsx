import { LessonCatalogue } from "@/components/LessonCatalogue";
import { courseModules, getLessonSummaries, lessons } from "@/lib/content";

export const metadata = { title: "الدروس المجانية" };

export default function LearnPage() {
  return <div className="shell inner-page learning-path-page">
    <div className="page-heading"><span className="eyebrow">مسار A1 · تعلّم مجاناً</span><h1>الهولندية <em>لحياتك اليومية.</em></h1><p>{lessons.length} درساً مجانياً في {courseModules.length} وحدات عملية. اختر درساً وتدرّب بالوتيرة التي تناسبك.</p></div>
    <LessonCatalogue lessons={getLessonSummaries()} modules={courseModules} />
    <p className="catalogue-note">هذا مسار تمهيدي ضمن A1. إكمال هذه الدروس لا يعني إتقان المستوى كاملاً. يُحفظ تقدمك على هذا الجهاز فقط.</p>
  </div>;
}
