import type { Metadata } from "next";
import { PlacementCheck } from "@/components/PlacementCheck";
import { placementBank } from "@/lib/server/placement";
import { publicPlacement } from "@/lib/placement-scoring";
import { getLessonSummaries } from "@/lib/content";

export const metadata: Metadata = {
  title: "اختبار البداية المجاني",
  description: "16 سؤالاً قصيراً في المفردات والجمل وفهم النصوص، مع دروس مقترحة لتبدأ تعلم الهولندية.",
};
export default function PlacementPage() {
  return <div className="shell inner-page placement-page">
    <div className="page-heading"><span className="eyebrow">خطوتك الأولى · مجاناً</span><h1>من أين تبدأ؟<br /><em>لنجرب معاً.</em></h1><p>أسئلة قصيرة تساعدك على اختيار دروس من مسار A1 تناسب ما تحتاج إلى مراجعته.</p></div>
    <PlacementCheck assessment={publicPlacement(placementBank)} lessons={getLessonSummaries().map(({ slug, title }) => ({ slug, title }))} />
  </div>;
}
