"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { href: "/learn", label: "الدروس" },
  { href: "/review", label: "المراجعة" },
  { href: "/exams", label: "الامتحانات" },
  { href: "/progress", label: "تقدّمي" },
  { href: "/account", label: "حسابي" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") === "A2" || /^\/(a2(?:[/-]|$)|learn\/a2-|reading\/a2-|scenarios\/a2-)/.test(pathname) ? "A2" : "A1";
  return <HeaderNavigation pathname={pathname} level={level} />;
}

export function SiteHeaderFallback() {
  return <HeaderNavigation pathname="" level="A1" />;
}

function HeaderNavigation({ pathname, level }: { pathname: string; level: "A1" | "A2" }) {
  const learningRoute = /^\/(learn|reading|vocabulary|scenarios|grammar|pronunciation|curriculum|a1-practice|a2(?:[/-]|$))/.test(pathname);
  const catalogueHref = level === "A2" ? "/learn?level=A2" : "/learn";

  return (
    <>
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="DutchFlow — الرئيسية">
          <span className="brand-mark" aria-hidden="true">d<span>.</span></span>
          <span dir="ltr">DutchFlow</span>
        </Link>
        <nav className="main-nav" aria-label="القائمة الرئيسية">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href === "/learn" ? catalogueHref : link.href === "/progress" && level === "A2" ? "/progress?level=A2" : link.href}
              aria-current={pathname === link.href ? "page" : link.href === "/learn" && learningRoute ? "location" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="header-action" href={catalogueHref}>
          اختر درسك <span aria-hidden="true">←</span>
        </Link>
      </div>
    </header>
    {level === "A2" && (learningRoute || pathname === "/progress") && <nav className="mobile-study-nav" aria-label="تنقل A2 على الموبايل">
      <Link href="/learn?level=A2" aria-current={pathname.startsWith("/learn") ? "location" : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v15h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3zM12 5v15" /></svg>تصفّح A2</Link>
      <Link href="/a2" aria-current={pathname === "/a2" ? "page" : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16" /></svg>خريطة A2</Link>
      <Link href="/progress?level=A2" aria-current={pathname === "/progress" ? "page" : undefined}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7" /></svg>إنجازي</Link>
    </nav>}
    </>
  );
}
