import Link from "next/link";
import { notFound } from "next/navigation";
import { getKnmLesson, knmCurriculum, knmLessons } from "@/lib/knm/content";
import { publicKnmQuestions, selectKnmQuestions } from "@/lib/server/knm/bank";
import { KnmQuiz } from "@/components/knm/KnmQuiz";
export function generateStaticParams() { return knmLessons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }) { const l = getKnmLesson((await params).slug); return {title:l ? `KNM — ${l.title.ar}` : "درس غير موجود"}; }
export default async function KnmLessonPage({ params }: { params: Promise<{slug: string}> }) {
  const lesson = getKnmLesson((await params).slug); if (!lesson) notFound();
  const theme = knmCurriculum.themes.find((t) => t.id === lesson.themeId)!; const next = knmLessons[lesson.number]; const previous = knmLessons[lesson.number-2];
  const selection = { mode: "lesson" as const, key: lesson.slug };
  return <><nav className="lesson-navigation" aria-label="التنقل بين دروس KNM"><Link href="/knm">← منهج KNM</Link>{previous && <Link href={`/knm/lessons/${previous.slug}`}>السابق: {previous.title.ar}</Link>}{next && <Link href={`/knm/lessons/${next.slug}`}>التالي: {next.title.ar} ←</Link>}</nav>
    <header className="page-heading"><span className="eyebrow">{theme.title.ar} · الدرس {lesson.number} من {knmLessons.length} · {lesson.durationMinutes} دقيقة</span>{lesson.kind === "application" && <p className="knm-application-tag">تطبيق موسّع · 12 سؤالاً</p>}<h1>{lesson.title.ar}</h1><p lang="nl" dir="ltr">{lesson.title.nl}</p></header>
    <nav className="lesson-contents panel" aria-label="أجزاء درس KNM"><strong>تعلّم ثم طبّق</strong><div><a href="#knm-knowledge">المعرفة الأساسية</a><a href="#knm-vocabulary">المفردات</a><a href="#knm-example">مثال واقعي</a>{lesson.dialogue && <a href="#knm-dialogue">حوار تطبيقي</a>}<a href="#knm-test">تدريب الدرس</a></div></nav>
    <section id="knm-knowledge" tabIndex={-1}><h2>المعرفة الأساسية</h2><p className="quiet">اقرأ الهولندية أولاً؛ افتح الترجمة عندما تحتاجها.</p><div className="knm-knowledge-grid">{lesson.points.map((point,i) => <article className="panel knm-point" key={`${point.objective}-${i}`}><span className="eyebrow">{String(i+1).padStart(2,"0")} · هدف {point.objective}</span><p lang="nl" dir="ltr">{point.nl}</p><details><summary>الترجمة العربية</summary><p>{point.ar}</p></details></article>)}</div></section>
    <section id="knm-vocabulary" tabIndex={-1} className="knm-section"><h2>مفردات ستحتاجها</h2><dl className="knm-vocabulary">{lesson.vocabulary.map((word) => <div className="panel" key={word.nl}><dt lang="nl" dir="ltr">{word.nl}</dt><dd>{word.ar}</dd></div>)}</dl></section>
    <section id="knm-example" tabIndex={-1} className="knm-section panel knm-example"><span className="eyebrow">موقف تعليمي مؤلّف</span><h2>المعرفة في الحياة اليومية</h2><p lang="nl" dir="ltr">{lesson.example.nl}</p><details><summary>افتح شرح الموقف بالعربية</summary><p>{lesson.example.ar}</p></details><p className="quiet">اسأل نفسك: أي جهة أو قاعدة تساعد في فهم هذا الموقف؟ ارجع إلى النقاط السابقة ثم جرّب التدريب.</p></section>
    {lesson.dialogue && <section id="knm-dialogue" tabIndex={-1} className="knm-section panel knm-example"><h2>حوار تطبيقي</h2><p className="quiet">حوار تعليمي مؤلّف؛ لاحظ كيف تُطلب المعلومات وتُوضّح الاتفاقات.</p><ol className="knm-dialogue">{lesson.dialogue.map((turn, index) => <li key={index}><strong lang="nl" dir="ltr">{turn.speaker}</strong><p lang="nl" dir="ltr">{turn.nl}</p><details><summary>ترجمة الحوار بالعربية</summary><p>{turn.ar}</p></details></li>)}</ol></section>}
    <section id="knm-test" tabIndex={-1} className="knm-section"><KnmQuiz key={lesson.slug} selection={selection} questions={publicKnmQuestions(selectKnmQuestions(selection)!)} revision={knmCurriculum.revision} nextLesson={next?.slug} /></section>
    <details className="panel knm-status"><summary>أهداف الدرس ومصادره</summary><p>الأهداف المعرفية: {lesson.objectives.join(" · ")}</p><ul>{knmCurriculum.sources.filter((s) => lesson.sourceIds.includes(s.id)).map((s) => <li key={s.id}><a href={s.url} lang="nl">{s.title}</a></li>)}</ul><p>راجعت المصادر بتاريخ {knmCurriculum.reviewedAt}. الأسماء والقواعد الشخصية قد تتغير؛ المصدر الرسمي هو المرجع.</p></details>
  </>;
}
