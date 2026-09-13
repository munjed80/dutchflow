import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";
import { lessons } from "@/lib/content";
export const metadata: Metadata = { title: "حسابي", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function AccountPage() {
  return <div className="shell inner-page account-page"><div className="page-heading"><span className="eyebrow">DutchFlow · حساب مجاني</span><h1>تعلّم هنا، وتابع من أي مكان</h1><p>حساب واحد يجمع تقدّمك في الدروس.</p></div><AccountPanel knownSlugs={lessons.map((lesson) => lesson.slug)} /></div>;
}
