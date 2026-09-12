import Link from "next/link";
import { lessons } from "@/lib/content";

export const metadata = { title: "الدروس المجانية" };

export default function LearnPage() {
  return <div className="shell inner-page">
    <div className="page-heading"><span className="eyebrow">مسارك في الهولندية</span><h1>ابدأ من الموقف،<br /><em>ثم تعلّم اللغة.</em></h1><p>أول دروس المستوى A1 متاحة الآن. اختر درساً وتدرّب بالوتيرة التي تناسبك.</p></div>
    <div className="level-heading"><span className="level-emblem">A1</span><div><h2>الخطوات الأولى</h2><p>جمل يومية أساسية مع تدريب سمعي واختبار قصير.</p></div><span className="quiet">{lessons.length} دروس متاحة</span></div>
    <div className="catalogue-list">{lessons.map((lesson) => <Link href={`/learn/${lesson.slug}`} className="catalogue-item" key={lesson.slug}>
      <span className="catalogue-number">{lesson.number}</span><div><h3>{lesson.title}</h3><span lang="nl" dir="ltr">{lesson.dutchTitle}</span><p>{lesson.description}</p></div><span className="catalogue-meta">{lesson.durationMinutes} دقائق</span><span className="catalogue-arrow" aria-hidden="true">←</span>
    </Link>)}</div>
    <p className="catalogue-note">هذه بداية منهج A1؛ سنضيف الدروس والمستويات التالية تدريجياً.</p>
  </div>;
}
