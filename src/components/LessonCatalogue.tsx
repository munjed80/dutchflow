"use client";

import Link from "next/link";
import { useState } from "react";
import type { CourseModule, LessonSummary } from "@/lib/content";
import { useLearningProgress } from "@/lib/use-learning-progress";

function normalizeSearch(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "").toLowerCase().trim();
}

export function LessonCatalogue({ lessons, modules }: { lessons: LessonSummary[]; modules: CourseModule[] }) {
  const completedLessons = useLearningProgress();
  const [query, setQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(lesson.slug));
  const search = normalizeSearch(query);
  const visibleLessons = lessons.filter((lesson) =>
    (selectedModule === "all" || lesson.moduleId === selectedModule) &&
    normalizeSearch(`${lesson.title} ${lesson.dutchTitle} ${lesson.description}`).includes(search),
  );

  return <>
    <div className="continue-banner panel">
      <div><span className="eyebrow">{nextLesson ? "الدرس التالي المقترح" : "أكملت الدروس المتاحة"}</span>
        <h2>{nextLesson?.title ?? "وقت المراجعة"}</h2>
        <p>{nextLesson ? "تابع بالترتيب، أو اختر الموقف الذي تحتاجه اليوم." : "يمكنك إعادة أي درس أو مراجعة نتائج تقدمك."}</p>
      </div>
      <Link className="button button-primary" href={nextLesson ? `/learn/${nextLesson.slug}` : "/progress"}>
        {nextLesson ? "تابع هذا الدرس" : "شاهد تقدمك"} <span aria-hidden="true">←</span>
      </Link>
    </div>

    <p className="placement-invitation">تبدأ للمرة الأولى؟ <Link className="text-link" href="/placement">جرّب اختبار البداية المجاني ←</Link></p>
    <div className="catalogue-tools">
      <label className="search-label" htmlFor="lesson-search">ابحث عن درس</label>
      <input id="lesson-search" type="search" className="lesson-search" value={query}
        placeholder="مثلاً: المواعيد، school، koffie" onChange={(event) => setQuery(event.target.value)} />
      <div className="module-filters" role="group" aria-label="تصفية حسب الوحدة">
        <button type="button" aria-pressed={selectedModule === "all"} onClick={() => setSelectedModule("all")}>كل الوحدات</button>
        {modules.map((module) => <button key={module.id} type="button" aria-pressed={selectedModule === module.id}
          onClick={() => setSelectedModule(module.id)}>{module.title}</button>)}
      </div>
      <p className="catalogue-results" role="status">عدد الدروس المعروضة: {visibleLessons.length} من {lessons.length}</p>
    </div>

    {modules.map((module) => {
      const group = visibleLessons.filter((lesson) => lesson.moduleId === module.id);
      if (!group.length) return null;
      const total = lessons.filter((lesson) => lesson.moduleId === module.id);
      const done = total.filter((lesson) => completedLessons.includes(lesson.slug)).length;
      return <section className="catalogue-module" key={module.id} aria-labelledby={`module-${module.id}`}>
        <div className="module-heading"><div><h2 id={`module-${module.id}`}>{module.title}</h2><p>{module.description}</p></div>
          <span className="module-count">أكملت {done} من {total.length}</span>
        </div>
        <div className="catalogue-list">{group.map((lesson) => {
          const complete = completedLessons.includes(lesson.slug);
          return <Link href={`/learn/${lesson.slug}`} className="catalogue-item" key={lesson.slug}>
            <span className={`catalogue-number${complete ? " catalogue-complete" : ""}`} aria-hidden="true">{complete ? "✓" : lesson.number}</span>
            <div className="catalogue-details"><h3>{lesson.title}</h3><span lang="nl" dir="ltr">{lesson.dutchTitle}</span><p>{lesson.description}</p></div>
            <span className="catalogue-meta">{lesson.durationMinutes} دقائق{complete && <strong className="completed-label">مكتمل</strong>}</span>
            <span className="catalogue-arrow" aria-hidden="true">←</span>
          </Link>;
        })}</div>
      </section>;
    })}
    {!visibleLessons.length && <div className="search-empty panel"><h2>لا توجد دروس مطابقة</h2><p>جرّب كلمة أخرى أو اعرض جميع الوحدات.</p>
      <button type="button" className="button button-primary" onClick={() => { setQuery(""); setSelectedModule("all"); }}>اعرض كل الدروس</button>
    </div>}
  </>;
}
