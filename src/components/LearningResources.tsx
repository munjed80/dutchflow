import Link from "next/link";
import { curriculumHref, levelHref, practiceHref, type CourseLevel } from "@/lib/levels";

export function LearningResources({ level }: { level: CourseLevel }) {
  const links = [
    { href: "/knm", title: "KNM · المجتمع الهولندي", description: "منهج مستقل للتحضير لجزء المعرفة" },
    { href: curriculumHref(level), title: `خريطة ${level}`, description: "الوحدات وأهداف التعلّم" },
    { href: levelHref("/reading", level), title: "القراءة", description: "رسائل ونصوص من الحياة اليومية" },
    { href: levelHref("/vocabulary", level), title: "المفردات", description: "ابحث عن كلمة واقرأها في جملة" },
    { href: levelHref("/scenarios", level), title: "المواقف الحوارية", description: "اختر ردّك وتابع الحوار" },
    { href: practiceHref(level), title: "المراجعات المتكاملة", description: "اجمع مهاراتك في موقف واحد" },
    { href: levelHref("/grammar", level), title: "القواعد", description: "شرح وأمثلة للرجوع إليها" },
    { href: "/pronunciation", title: "الحروف والنطق", description: "تدرّب على أصوات الهولندية" },
    ...(level === "A2" ? [{ href: "/a2-recycling", title: "استرجاع ما تعلّمته", description: "استخدم تعبيراتك في سياق جديد" }] : []),
  ];
  return <details className="learning-resources panel">
    <summary>تدرّب حسب المهارة <span>القراءة، المفردات، المحادثة والمزيد</span></summary>
    <nav className="learning-resource-grid" aria-label={`موارد التعلّم ${level}`}>
      {links.map((link) => <Link key={link.href} href={link.href}>
        <strong>{link.title} <span aria-hidden="true">←</span></strong>
        <span>{link.description}</span>
      </Link>)}
    </nav>
  </details>;
}
