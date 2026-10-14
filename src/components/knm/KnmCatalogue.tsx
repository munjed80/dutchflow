"use client";
import Link from "next/link";
import { useState } from "react";
import { useKnm } from "./KnmProvider";
import type { Bilingual } from "@/lib/knm/types";
type Summary = { slug: string; number: number; themeId: string; title: Bilingual; durationMinutes: number };
export function KnmCatalogue({ lessons, themes }: { lessons: Summary[]; themes: { id: string; title: Bilingual }[] }) {
  const progress = useKnm(); const [search, setSearch] = useState(""), [theme, setTheme] = useState("all");
  const known = progress.ready && !progress.loading; const next = known ? lessons.find((l) => !progress.completedLessons.includes(l.slug)) : null;
  const visible = lessons.filter((l) => (theme === "all" || l.themeId === theme) && `${l.title.ar} ${l.title.nl}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <>
    <section className="knm-next panel">
      {progress.loading ? <p role="status">جارٍ تحميل تقدّم KNM…</p> : !known ? <><p role="alert">{progress.error || "تقدّم KNM غير متاح حالياً."}</p><button className="button button-secondary" onClick={() => void progress.refresh()}>أعد تحميل تقدّم KNM</button></>
        : <><div><span className="eyebrow">{next ? "خطوتك التالية" : "أكملت تدريبات الدروس"}</span><h2>{next?.title.ar ?? "اجمع معرفتك في امتحان تدريبي"}</h2><p>{next ? `الدرس ${next.number} · ${next.durationMinutes} دقيقة` : "النتائج تدريبية؛ جرّب الأسئلة والمصادر الرسمية أيضاً."}</p><p>أكملت {progress.completedLessons.length} من {lessons.length} تدريب درس · {progress.wrongQuestionIds.length} سؤالاً للمراجعة</p></div><Link className="button button-primary" href={next ? `/knm/lessons/${next.slug}` : "/knm/exams"}>{next ? "تابع هذا الدرس" : "افتح الامتحانات"} ←</Link></>}
    </section>
    <div className="knm-tools panel"><div><label htmlFor="knm-search">ابحث في منهج KNM</label><input id="knm-search" type="search" placeholder="DigiD، السكن، التعليم…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div><label htmlFor="knm-theme">المحور</label><select id="knm-theme" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="all">جميع المحاور</option>{themes.map((t) => <option key={t.id} value={t.id}>{t.title.ar}</option>)}</select></div>
      <p role="status">{visible.length} من {lessons.length} درساً</p>{(search || theme !== "all") && <button className="catalogue-reset" onClick={() => { setSearch(""); setTheme("all"); }}>أعد ضبط البحث</button>}
    </div>
    {themes.map((t) => { const group = visible.filter((l) => l.themeId === t.id); return group.length ? <section className="knm-theme" key={t.id} aria-labelledby={`knm-theme-${t.id}`}><div className="module-heading"><div><span className="eyebrow">المحور {t.id}</span><h2 id={`knm-theme-${t.id}`}>{t.title.ar}</h2><p lang="nl" dir="ltr">{t.title.nl}</p></div><span className="module-count">{group.length} دروس</span></div><div className="knm-lesson-grid">{group.map((l) => <Link className="knm-lesson-card panel" href={`/knm/lessons/${l.slug}`} key={l.slug}><span className="eyebrow">{String(l.number).padStart(2,"0")} · {l.durationMinutes} دقيقة</span><h3>{l.title.ar}</h3><p lang="nl" dir="ltr">{l.title.nl}</p><span>{known && progress.completedLessons.includes(l.slug) ? "✓ أكملت التدريب" : "افتح الدرس ←"}</span></Link>)}</div></section> : null; })}
    {!visible.length && <div className="panel search-empty"><h2>لا توجد دروس مطابقة</h2><p>جرّب كلمة أخرى أو أعد ضبط البحث.</p><button className="button button-secondary" onClick={() => {setSearch(""); setTheme("all");}}>اعرض المنهج كله</button></div>}
  </>;
}
