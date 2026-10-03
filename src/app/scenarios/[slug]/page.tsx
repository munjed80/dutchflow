import { levelHref, curriculumHref } from "@/lib/levels";
import Link from "next/link";
import { notFound } from "next/navigation";
import { scenarios, getScenario } from "@/lib/scenarios";
import { getLesson, sourceLevel } from "@/lib/content";
import { ScenarioPractice } from "@/components/ScenarioPractice";

export function generateStaticParams() { return scenarios.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const scenario = getScenario((await params).slug);
  return { title: scenario ? `موقف — ${scenario.title}` : "الموقف غير موجود" };
}
export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const scenario = getScenario((await params).slug);
  if (!scenario) notFound();
  const level = sourceLevel(scenario.sourceLessons);
  const peers = scenarios.filter((resource) => sourceLevel(resource.sourceLessons) === level);
  const next = peers[peers.indexOf(scenario) + 1];
  return <div className="shell inner-page scenario-page">
    <nav className="breadcrumb" aria-label="مسار المواقف"><Link href={levelHref("/learn", level)}>الدروس</Link><span>/</span><Link href={levelHref("/scenarios", level)}>المواقف الحوارية</Link><span>/ {scenario.title}</span></nav>
    <div className="page-heading"><span className="eyebrow">تدريب نصي موجّه · {scenario.turns.length} جولات</span><h1>{scenario.title}</h1><p className="scenario-dutch" lang="nl" dir="ltr">{scenario.dutchTitle}</p></div>
    <aside className="panel scenario-mission" aria-labelledby="scenario-mission-heading"><h2 id="scenario-mission-heading">دورك وهدفك</h2><p>{scenario.mission}</p><p className="quiet">استخدم تفاصيل الموقف الخيالية. التدريب باختيارات معدّة مسبقاً، ولا يقيّم النطق أو المحادثة الحرة. لا تُحفظ الإجابات ولا تغيّر تقدّم الدروس.</p></aside>
    <ScenarioPractice key={scenario.slug} scenario={scenario} />
    <section className="reading-related"><h2>دروس تساعدك في هذا الموقف</h2><div>{scenario.sourceLessons.map((slug) => <Link className="text-link" href={`/learn/${slug}`} key={slug}>{getLesson(slug)!.title} ←</Link>)}</div></section>
    <Link className="text-link" href={`${curriculumHref(level)}#${scenario.unitId}`}>هدف الموقف في خريطة {level} ←</Link>
    <Link className="next-lesson" href={next ? `/scenarios/${next.slug}` : levelHref("/scenarios", level)}>{next ? `موقف آخر: ${next.title}` : "عد إلى جميع المواقف"} ←</Link>
  </div>;
}
