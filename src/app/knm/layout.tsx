import Link from "next/link";
import { KnmNavigation } from "@/components/knm/KnmNavigation";
import { KnmProvider } from "@/components/knm/KnmProvider";
import { knmLessonSummaries } from "@/lib/knm/content";
import { knmQuestionIds } from "@/lib/server/knm/bank";
export default function KnmLayout({ children }: { children: React.ReactNode }) {
  return <KnmProvider lessonSlugs={knmLessonSummaries.map((l) => l.slug)} questionIds={knmQuestionIds}><div className="shell inner-page knm-shell">
    <KnmNavigation />
    {children}
    <p className="knm-footer-note">DutchFlow مصدر تعليمي مستقل. الأسئلة مؤلّفة وليست أسئلة DUO الفعلية. <Link className="text-link" href="https://www.inburgeren.nl/examen-doen/oefenen.jsp">افتح التدريب الرسمي</Link></p>
  </div></KnmProvider>;
}
