"use client";
import Link from "next/link";
import { useKnm } from "./KnmProvider";
import type { Bilingual } from "@/lib/knm/types";
export function KnmProgressPanel({ lessons, themes }: { lessons: { slug: string; themeId: string; title: Bilingual }[]; themes: { id: string; title: Bilingual }[] }) {
  const progress = useKnm();
  if (progress.loading) return <p role="status">جارٍ تحميل تقدّم KNM…</p>;
  if (!progress.ready) return <div className="panel knm-status"><p role="alert">{progress.error || "تعذّر تحميل التقدّم."}</p><button className="button button-secondary" onClick={() => void progress.refresh()}>أعد تحميل تقدّم KNM</button>{!progress.userId && <button className="button button-secondary" onClick={progress.resetGuest}>امسح بيانات KNM المحلية</button>}<Link href="/knm">تصفّح الدروس ←</Link></div>;
  return <><section className="knm-next panel"><div><h2>أكملت {progress.completedLessons.length} من {lessons.length} تدريب درس</h2><p>{progress.userId ? "تقدّم KNM محفوظ في حسابك." : "تقدّم KNM محفوظ في هذا المتصفح لكل من يستخدمه."}</p><p>إكمال التدريب يعني الإجابة الصحيحة عن أسئلة الدرس في محاولة؛ لا يعني إتقان KNM أو النجاح الرسمي.</p></div><Link className="button button-primary" href="/knm/review">راجع {progress.wrongQuestionIds.length} سؤالاً ←</Link></section>
    {progress.error && <p role="alert">{progress.error}</p>}
    {themes.map((t) => { const group = lessons.filter((l) => l.themeId === t.id); const completed = group.filter((l) => progress.completedLessons.includes(l.slug)).length; return <section key={t.id} className="panel knm-status"><h2>{t.title.ar}</h2><p>{completed} من {group.length} تدريبات</p><progress aria-label={`تقدّم ${t.title.ar}`} value={completed} max={group.length} /><ul>{group.map((l) => <li key={l.slug}><Link href={`/knm/lessons/${l.slug}`}>{l.title.ar} {progress.completedLessons.includes(l.slug) && "✓"}</Link></li>)}</ul></section>; })}
    {!progress.userId && <button className="button button-secondary" onClick={progress.resetGuest}>امسح بيانات KNM المحلية</button>}
    <p className="quiet">تقدّم الزائر منفصل عن الحساب؛ تسجيل الدخول لا يستورد بيانات الجهاز تلقائياً. مراجعة الأخطاء تُحدّث عند الإجابة مجدداً، ولا تحفظ نص إجاباتك أو درجة امتحان رسمية.</p>
  </>;
}
