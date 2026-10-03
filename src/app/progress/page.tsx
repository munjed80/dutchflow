import { LevelNavigation } from "@/components/LevelNavigation";
import { parseLevel } from "@/lib/levels";
import { ProgressOverview } from "@/components/ProgressOverview";
import { getLevelModules, getLessonSummaries } from "@/lib/content";

export const metadata = { title: "تقدّمي" };

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const level = parseLevel((await searchParams).level);
  const courseModules = getLevelModules(level);
  return <div className="shell inner-page progress-page"><div className="page-heading"><span className="eyebrow">كل خطوة لها قيمة</span><h1>تقدّمك،<br /><em>درساً بعد درس.</em></h1><p>تابع ما أنجزته، وأكمل من حيث توقفت.</p></div><LevelNavigation path="/progress" level={level} /><ProgressOverview key={level} level={level} lessons={getLessonSummaries(level)} modules={courseModules} /></div>;
}
