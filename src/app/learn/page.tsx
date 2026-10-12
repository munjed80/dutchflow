import { LevelNavigation } from "@/components/LevelNavigation";
import { parseLevel, levelHref } from "@/lib/levels";
import { LearningResources } from "@/components/LearningResources";
import { LessonCatalogue } from "@/components/LessonCatalogue";
import Link from "next/link";
import { getLevelModules, getLessonSummaries, getLevelLessons } from "@/lib/content";

export const metadata = { title: "الدروس المجانية" };

export default async function LearnPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const level = parseLevel((await searchParams).level);
  const courseModules = getLevelModules(level);
  const lessons = getLevelLessons(level);
  return <div className="shell inner-page learning-path-page">
    <div className="page-heading"><span className="eyebrow">مسار {level} · تعلّم مجاناً</span><h1>الهولندية <em>لحياتك اليومية.</em></h1><p>الدروس المجانية: {lessons.length} · الوحدات العملية: {courseModules.length}. اختر درساً وتدرّب بالوتيرة التي تناسبك.</p></div>
    <LevelNavigation path="/learn" level={level} />
    <LessonCatalogue key={level} level={level} lessons={getLessonSummaries(level)} modules={courseModules} resources={<LearningResources level={level} />} />
    <div className="continue-banner panel"><div><span className="eyebrow">وسّع لغتك بالقراءة</span><h2>من الجملة إلى النص</h2><p>اقرأ رسائل ومواقف يومية، وتعلّم المفردات والقواعد في سياقها.</p></div><Link className="button button-primary" href={levelHref("/reading", level)}>افتح مكتبة القراءة</Link></div>
    {level === "A2" && <p className="catalogue-note">يتضمن A2 ثماني وحدات مؤلّفة. التسجيلات الثابتة والمراجعة المستقلة لم تكتمل بعد.</p>}
    <p className="catalogue-note">هذا محتوى ضمن {level}. إكمال هذه الدروس لا يعني إتقان المستوى كاملاً. يُحفظ تقدّم الزائر في المتصفح، وتقدّم المستخدم المسجّل في حسابه عند تفعيل الحسابات.</p>
  </div>;
}
