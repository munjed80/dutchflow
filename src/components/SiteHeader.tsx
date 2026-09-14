"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/learn", label: "الدروس" },
  { href: "/review", label: "المراجعة" },
  { href: "/exams", label: "الامتحانات" },
  { href: "/progress", label: "تقدّمي" },
  { href: "/account", label: "حسابي" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
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
              href={link.href}
              aria-current={pathname === link.href || (link.href === "/learn" && pathname.startsWith("/learn/")) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="header-action" href="/learn/introductions">
          ابدأ التعلّم <span aria-hidden="true">←</span>
        </Link>
      </div>
    </header>
  );
}
