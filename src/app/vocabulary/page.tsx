import Link from "next/link";
import { VocabularyLibrary } from "@/components/VocabularyLibrary";
import { lessons, courseModules } from "@/lib/content";
import { lessonExtensions } from "@/lib/curriculum";
import { buildVocabulary } from "@/lib/vocabulary";

export const metadata = { title: "مكتبة المفردات" };

export default function VocabularyPage() {
  const entries = buildVocabulary(lessons, lessonExtensions);
  const modules = courseModules.filter((module) => entries.some((entry) => entry.moduleId === module.id));
  return <div className="shell inner-page vocabulary-page">
    <div className="breadcrumb"><Link href="/learn">الدروس</Link><span> / مكتبة المفردات</span></div>
    <div className="page-heading"><span className="eyebrow">تعلّم الكلمة في سياقها</span><h1>مفرداتك، <em>مع أمثلة وصيغ.</em></h1>
      <p>ابحث بالعربية أو الهولندية في مفردات الدروس، وصيغ الجمع والتصريف، وجمل الأمثلة.</p></div>
    <p className="reading-note">هذه مفردات من الدروس التي أضفنا لها شرحاً لغوياً، وليست قاموساً شاملاً. قد تتكرر الكلمة في أكثر من سياق. الاستماع والمراجعة يخصّان جملة المثال كاملة؛ الصوت يعتمد على جهازك عند عدم توفر تسجيل.</p>
    <p className="quiet">تُحفظ جملة المثال للمراجعة في هذا المتصفح، وتبقى مشتركة بين مستخدميه. <Link className="text-link" href="/review">افتح قائمة المراجعة ←</Link></p>
    <VocabularyLibrary entries={entries} modules={modules} />
  </div>;
}
