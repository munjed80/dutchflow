import Link from "next/link";
import { KnmCatalogue } from "@/components/knm/KnmCatalogue";
import { knmCurriculum, knmLessonSummaries } from "@/lib/knm/content";
export const metadata = { title: "KNM — المعرفة بالمجتمع الهولندي" };
export default function KnmPage() {
  return <><header className="page-heading knm-heading"><span className="eyebrow">KNM · Kennis van de Nederlandse Maatschappij</span><h1>افهم المجتمع.<br /><em>واستعد بثقة.</em></h1><p>منهج مستقل مرتبط بالأهداف الرسمية المعمول بها منذ 1 يوليو 2025: ثمانية محاور، 48 درساً و449 سؤالاً أصلياً. شرح هولندي مبسّط مع ترجمة عربية وأمثلة من الحياة اليومية.</p><div className="knm-actions"><Link className="button button-primary" href="/knm/exams">جرّب امتحاناً تدريبياً ←</Link><Link className="text-link" href="/knm/sources">المصادر وخريطة التغطية</Link></div></header>
    <KnmCatalogue lessons={knmLessonSummaries} themes={knmCurriculum.themes} />
  </>;
}
