"use client";

import Link from "next/link";
import type { CourseModule, LessonSummary } from "@/lib/content";
import { useLearningProgress } from "@/lib/use-learning-progress";

export function ProgressOverview({ lessons, modules }: { lessons: LessonSummary[]; modules: CourseModule[] }) {
  const completedLessons = useLearningProgress();

  const count = lessons.filter((lesson) => completedLessons.includes(lesson.slug)).length;
  const nextLesson = lessons.find((lesson) => !completedLessons.includes(lesson.slug));

  return (
    <>
      <div className="progress-summary panel">
        <div><span className="eyebrow">مسارك الحالي · A1</span><h2>{count} <small>/ {lessons.length}</small></h2><p>دروس أتممتها</p></div>
        <div className="progress-visual" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={lessons.length} aria-label="الدروس المكتملة">
          <div style={{ width: `${(count / lessons.length) * 100}%` }} />
        </div>
        <p className="quiet">يُحفظ التقدم على هذا الجهاز فقط في النسخة الحالية.</p>
        <Link className="button button-primary" href={nextLesson ? `/learn/${nextLesson.slug}` : "/learn"}>
          {nextLesson ? "تابع التعلّم" : "راجع الدروس"} <span aria-hidden="true">←</span>
        </Link>
      </div>
      {modules.map((module) => {
        const group = lessons.filter((lesson) => lesson.moduleId === module.id);
        const completed = group.filter((lesson) => completedLessons.includes(lesson.slug)).length;
        return <section className="progress-module" key={module.id} aria-labelledby={`progress-${module.id}`}>
          <div className="module-heading"><h2 id={`progress-${module.id}`}>{module.title}</h2><span className="module-count">أكملت {completed} من {group.length}</span></div>
          <div className="progress-lessons">
        {group.map((lesson) => {
          const done = completedLessons.includes(lesson.slug);
          return <Link className="progress-row panel" href={`/learn/${lesson.slug}`} key={lesson.slug}>
            <span className={`completion-dot${done ? " done" : ""}`}>{done ? "✓" : lesson.number}</span>
            <span><strong>{lesson.title}</strong><small lang="nl" dir="ltr">{lesson.dutchTitle}</small></span>
            <span className="progress-status">{done ? "مكتمل" : "ابدأ الدرس"}</span>
          </Link>;
        })}
          </div>
        </section>;
      })}
    </>
  );
}
