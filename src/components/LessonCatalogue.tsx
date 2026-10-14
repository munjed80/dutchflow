"use client";

import { levelHref, type CourseLevel } from "@/lib/levels";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { CourseModule, LessonSummary } from "@/lib/content";
import { useLearning } from "./LearningProvider";

function normalizeSearch(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, "").toLowerCase().trim();
}

export function LessonCatalogue({ lessons, modules, level = "A1", resources }: { lessons: LessonSummary[]; modules: CourseModule[]; level?: CourseLevel; resources?: ReactNode }) {
  const learning = useLearning();
  const progressKnown = learning.ready && !learning.loading && !learning.error;
  const completedLessons = progressKnown ? learning.completedLessons : [];
  const [query, setQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [status, setStatus] = useState("all");
  const activeStatus = progressKnown ? status : "all";
  const completedCount = lessons.filter((lesson) => completedLessons.includes(lesson.slug)).length;
  const filtersActive = Boolean(query || selectedModule !== "all" || activeStatus !== "all");
  function resetFilters() { setQuery(""); setSelectedModule("all"); setStatus("all"); }
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(lesson.slug));
  const search = normalizeSearch(query);
  const visibleLessons = lessons.filter((lesson) =>
    (selectedModule === "all" || lesson.moduleId === selectedModule) &&
    (activeStatus === "all" || completedLessons.includes(lesson.slug) === (activeStatus === "completed")) &&
    normalizeSearch(`${lesson.title} ${lesson.dutchTitle} ${lesson.description}`).includes(search),
  );

  return <>
    <div className="continue-banner panel">
      {learning.loading ? <p role="status">جارٍ تحميل تقدّمك… يمكنك تصفّح الدروس أدناه.</p>
        : !progressKnown ? <><p role="alert">تعذّر تحميل تقدّمك. يمكنك فتح أي درس أو إعادة المحاولة.</p>
          <button className="button button-secondary" onClick={() => void learning.refresh()}>أعد تحميل التقدّم</button></>
        : <>
      <div><span className="eyebrow">{nextLesson ? "الدرس التالي المقترح" : "أكملت الدروس المتاحة"}</span>
        <h2>{nextLesson?.title ?? "وقت المراجعة"}</h2>
        {nextLesson && <div className="next-lesson-meta"><span>الدرس {nextLesson.number} من {lessons.length}</span><span>{nextLesson.durationMinutes} دقائق</span></div>}
        <p>{nextLesson ? "تابع بالترتيب، أو اختر الموقف الذي تحتاجه اليوم." : "يمكنك إعادة أي درس أو مراجعة نتائج تقدمك."}</p>
      </div>
      <Link className="button button-primary" href={nextLesson ? `/learn/${nextLesson.slug}` : levelHref("/progress", level)}>
        {nextLesson ? "تابع هذا الدرس" : "شاهد تقدمك"} <span aria-hidden="true">←</span>
      </Link>
      </>}
    </div>

    {level === "A1" && <p className="placement-invitation">تبدأ للمرة الأولى؟ <Link className="text-link" href="/placement">جرّب اختبار البداية المجاني ←</Link></p>}
    {resources}
    <div className="catalogue-tools panel">
      <div className="catalogue-tools-heading"><h2>اختر درساً يناسبك</h2>
        {progressKnown && <Link href={levelHref("/progress", level)} className="catalogue-progress-link">أكملت {completedCount} من {lessons.length} <span aria-hidden="true">←</span></Link>}
      </div>
      <div className="catalogue-search-row"><div>
      <label className="search-label" htmlFor="lesson-search">ابحث عن درس</label>
      <input id="lesson-search" type="search" className="lesson-search" value={query}
        placeholder="مثلاً: المواعيد، school، koffie" onChange={(event) => setQuery(event.target.value)} />
      </div><div>
        <label className="search-label" htmlFor="lesson-status">حالة الدرس</label>
        <select id="lesson-status" className="lesson-status" value={activeStatus} disabled={!progressKnown} aria-describedby={!progressKnown ? "lesson-status-help" : undefined}
          onChange={(event) => setStatus(event.target.value)}>
          <option value="all">كل الدروس</option><option value="remaining">الدروس المتبقية</option><option value="completed">الدروس المكتملة</option>
        </select>
      </div></div>
      {!progressKnown && <p id="lesson-status-help" className="quiet">تصفية الدروس حسب حالتها متاحة بعد تحميل تقدّمك.</p>}
      <div className="catalogue-module-select">
        <label className="search-label" htmlFor="lesson-module">الوحدة</label>
        <select id="lesson-module" className="lesson-status" value={selectedModule} onChange={(event) => setSelectedModule(event.target.value)}>
          <option value="all">كل الوحدات</option>
          {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
        </select>
      </div>
      <div className="module-filters" role="group" aria-label="تصفية حسب الوحدة">
        <button type="button" aria-pressed={selectedModule === "all"} onClick={() => setSelectedModule("all")}>كل الوحدات</button>
        {modules.map((module) => <button key={module.id} type="button" aria-pressed={selectedModule === module.id}
          onClick={() => setSelectedModule(module.id)}>{module.title}</button>)}
      </div>
      <div className="catalogue-results-row"><p className="catalogue-results" role="status">عدد الدروس المعروضة: {visibleLessons.length} من {lessons.length}</p>
        {filtersActive && <button type="button" className="catalogue-reset" onClick={resetFilters}>إعادة ضبط الفلاتر</button>}
      </div>
    </div>

    {modules.map((module) => {
      const group = visibleLessons.filter((lesson) => lesson.moduleId === module.id);
      if (!group.length) return null;
      const total = lessons.filter((lesson) => lesson.moduleId === module.id);
      const done = total.filter((lesson) => completedLessons.includes(lesson.slug)).length;
      return <section className="catalogue-module" key={module.id} aria-labelledby={`module-${module.id}`}>
        <div className="module-heading"><div><h2 id={`module-${module.id}`}>{module.title}</h2><p>{module.description}</p></div>
          <span className="module-count">{progressKnown ? `أكملت ${done} من ${total.length}` : `${total.length} دروس`}</span>
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
    {!visibleLessons.length && <div className="search-empty panel"><h2>{activeStatus === "completed" && !query && selectedModule === "all" ? "لم تُكمل درساً في هذا المستوى بعد" : activeStatus === "remaining" && !query && selectedModule === "all" ? "أكملت كل دروس هذا المستوى" : "لا توجد دروس مطابقة"}</h2>
      <p>{activeStatus === "completed" ? "اعرض كل الدروس لبدء درس جديد، أو عدّل البحث والوحدة." : activeStatus === "remaining" ? "يمكنك إعادة الدروس المكتملة للمراجعة، أو تعديل الفلاتر." : "جرّب كلمة أخرى أو اعرض جميع الوحدات."}</p>
      <button type="button" className="button button-primary" onClick={resetFilters}>اعرض كل الدروس</button>
    </div>}
  </>;
}
