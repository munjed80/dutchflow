import Link from "next/link";
import { courseLevels, levelHref, type CourseLevel } from "@/lib/levels";
export function LevelNavigation({ path, level }: { path: string; level: CourseLevel }) {
  return <nav className="curriculum-index level-navigation" aria-label="اختر المستوى">
    {courseLevels.map((item) => <Link key={item} href={levelHref(path, item)} aria-current={level === item ? "page" : undefined}>{item === "A1" ? "A1 · الأساسيات" : "A2 · الوحدة الأولى"}</Link>)}
  </nav>;
}
