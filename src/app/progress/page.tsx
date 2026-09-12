import { ProgressOverview } from "@/components/ProgressOverview";

export const metadata = { title: "تقدّمي" };

export default function ProgressPage() {
  return <div className="shell inner-page progress-page"><div className="page-heading"><span className="eyebrow">كل خطوة لها قيمة</span><h1>تقدّمك،<br /><em>درساً بعد درس.</em></h1><p>تابع ما أنجزته، وأكمل من حيث توقفت.</p></div><ProgressOverview /></div>;
}
