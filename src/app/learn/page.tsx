import { LevelNavigation } from "@/components/LevelNavigation";
import { parseLevel, levelHref } from "@/lib/levels";
import { LessonCatalogue } from "@/components/LessonCatalogue";
import Link from "next/link";
import { getLevelModules, getLessonSummaries, getLevelLessons } from "@/lib/content";

export const metadata = { title: "الدروس المجانية" };

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const level = parseLevel((await searchParams).level);
  const courseModules = getLevelModules(level);
  const lessons = getLevelLessons(level);
  return <div className="shell inner-page learning-path-page">
    {level === "A2" && <p className="reading-note">المتاح الآن أول وحدة A2. بقية المنهج قيد الإعداد، والتسجيلات الثابتة والمراجعة المستقلة لم تكتمل بعد.</p>}
    <p className="curriculum-entry"><Link className="text-link" href="/pronunciation">الحروف وأصوات الهولندية ←</Link></p>
    <div className="page-heading"><span className="eyebrow">مسار {level} · تعلّم مجاناً</span><h1>الهولندية <em>لحياتك اليومية.</em></h1><p>الدروس المجانية: {lessons.length} · الوحدات العملية: {courseModules.length}. اختر درساً وتدرّب بالوتيرة التي تناسبك.</p></div>
    <LevelNavigation path="/learn" level={level} />
    <p className="curriculum-entry"><Link className="text-link" href={level === "A1" ? "/curriculum" : "/a2"}>استكشف خريطة {level} وأهداف التعلّم ←</Link></p>
    <p className="curriculum-entry"><Link className="text-link" href={levelHref("/vocabulary", level)}>ابحث في مكتبة المفردات ←</Link></p>
    <p className="curriculum-entry"><Link className="text-link" href={levelHref("/scenarios", level)}>تدرّب على المواقف الحوارية ←</Link></p>
    <p className="curriculum-entry"><Link className="text-link" href={level === "A1" ? "/a1-practice" : "/a2-practice"}>طبّق في مراجعات {level} المتكاملة ←</Link></p>
    <p className="curriculum-entry"><Link className="text-link" href={levelHref("/grammar", level)}>مرجع القواعد والأمثلة ←</Link></p>
    <LessonCatalogue key={level} level={level} lessons={getLessonSummaries(level)} modules={courseModules} />
    <div className="continue-banner panel"><div><span className="eyebrow">وسّع لغتك بالقراءة</span><h2>من الجملة إلى النص</h2><p>اقرأ رسائل ومواقف يومية، وتعلّم المفردات والقواعد في سياقها.</p></div><Link className="button button-primary" href={levelHref("/reading", level)}>افتح مكتبة القراءة</Link></div>
    <p className="catalogue-note">هذا محتوى ضمن {level}. إكمال هذه الدروس لا يعني إتقان المستوى كاملاً. يُحفظ تقدّم الزائر في المتصفح، وتقدّم المستخدم المسجّل في حسابه عند تفعيل الحسابات.</p>
  </div>;
}
