import { ProgressOverview } from "@/components/ProgressOverview";
import { courseModules, getLessonSummaries } from "@/lib/content";

export const metadata = { title: "تقدّمي" };

export default function ProgressPage() {
  return <div className="shell inner-page progress-page"><div className="page-heading"><span className="eyebrow">كل خطوة لها قيمة</span><h1>تقدّمك،<br /><em>درساً بعد درس.</em></h1><p>تابع ما أنجزته، وأكمل من حيث توقفت.</p></div><ProgressOverview lessons={getLessonSummaries()} modules={courseModules} /></div>;
}
