import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LearningProvider } from "@/components/LearningProvider";
import { ReviewProvider } from "@/components/ReviewProvider";
import { lessons } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DutchFlow — تعلّم الهولندية للحياة اليومية", template: "%s | DutchFlow" },
  description: "تعلّم الهولندية بالعربية من مواقف الحياة الحقيقية. دروس وتمارين مجانية، مع امتحانات تدريبية منفصلة عند إطلاقها.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>
    <LearningProvider><ReviewProvider allowedIds={lessons.flatMap((lesson) => lesson.phrases.map((phrase) => phrase.id))}><SiteHeader />
    <main>{children}</main></ReviewProvider></LearningProvider>
    <footer className="site-footer"><div className="shell footer-inner">
      <span dir="ltr">DutchFlow</span><p>هولندية أوضح، خطوة بعد خطوة.</p>
      <span>© {new Date().getFullYear()}</span>
    </div></footer>
  </body></html>;
}
