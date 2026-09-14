import { ReviewPractice } from "@/components/ReviewPractice";
import { lessons } from "@/lib/content";

export const metadata = { title: "قائمة المراجعة" };

export default function ReviewPage() {
  const phrases = lessons.flatMap((lesson) => lesson.phrases.map((phrase) => ({ ...phrase, lessonSlug: lesson.slug, lessonTitle: lesson.title })));
  return <div className="shell inner-page review-page"><div className="page-heading"><span className="eyebrow">مراجعة مجانية</span><h1>ارجع للجمل.<br /><em>وثبّتها في ذاكرتك.</em></h1><p>اجمع الجمل التي تحتاجها، وراجعها في جلسات من عشر جمل كحد أقصى.</p></div><ReviewPractice phrases={phrases} /></div>;
}
