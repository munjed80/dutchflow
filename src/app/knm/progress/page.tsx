import { KnmProgressPanel } from "@/components/knm/KnmProgress";
import { knmCurriculum, knmReviewLessons } from "@/lib/knm/content";
export const metadata={title:"تقدّمي في KNM"};
export default function KnmProgress(){return <><header className="page-heading"><span className="eyebrow">مسار مستقل</span><h1>تقدّمك <em>في KNM.</em></h1><p>تابع تدريبات الدروس ومراجعة الأخطاء حسب المحور.</p></header><KnmProgressPanel lessons={knmReviewLessons} themes={knmCurriculum.themes}/></>;}
