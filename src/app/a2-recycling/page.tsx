import Link from "next/link";
import { a2Recycling } from "@/lib/a2-recycling";

export const metadata = { title: "استرجاع وتطبيق — A2" };
export default function RecyclingPage() {
  return <div className="shell inner-page curriculum-page">
    <div className="page-heading"><span className="eyebrow">A2 · مراجعة بين الوحدات</span><h1>استرجع وغيّر السياق</h1><p>{a2Recycling.length} مراجعة قصيرة تربط لغة وحدات مختلفة. حاول من الذاكرة أولًا، ثم غيّر الزمن أو المخاطَب أو المعلومة في تمرين التحويل.</p></div>
    <p className="reading-note">اختر مراجعة بعد دراسة الدروس المرتبطة بها، ثم عد إليها لاحقًا. الإجابات مؤقتة، والأمثلة للمقارنة الذاتية؛ لا توجد درجة أو علامة إكمال أو مواعيد مراجعة آلية.</p>
    <Link className="text-link" href="/a2">العودة إلى مسار A2 ←</Link>
    <div className="curriculum-units">{a2Recycling.map((set, index) => <section className="panel curriculum-unit" key={set.slug}>
      <span className="eyebrow">مراجعة {index + 1} · استرجاع وتحويل</span><h2>{set.title}</h2><p>{set.goal}</p>
      <Link className="button button-primary" href={`/a2-recycling/${set.slug}`}>ابدأ: {set.title} ←</Link>
    </section>)}</div>
  </div>;
}
