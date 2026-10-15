import Link from "next/link";
import { getLesson } from "@/lib/content";
import { newcomerPath } from "@/lib/a2-newcomers";

export function NewcomerPreparation({ preparation }: { preparation: (typeof newcomerPath)[number] }) {
  return <section className="panel newcomer-preparation" aria-labelledby="preparation-heading">
    <span className="eyebrow">A2 · مواقف القادمين الجدد · نحو {preparation.minutes} دقيقة</span>
    <h2 id="preparation-heading">ما الذي ستتمرّن عليه؟</h2>
    <p>{preparation.goal}</p>
    <p>الجهات والرسائل والمواعيد والخطوات في هذا التطبيق خيالية للتدريب على اللغة. للمواقف الحقيقية، اتبع رسالة الجهة المعنية واستفسر منها عند الغموض. اكتب أسماء وبيانات مختلقة فقط.</p>
    <details><summary>حضّر الكلمات والعبارات قبل المحاولة</summary>
      <h3>مفردات في السياق</h3>
      <dl className="newcomer-vocabulary">{preparation.vocabulary.map((word) => <div key={word.dutch}><dt lang="nl" dir="ltr">{word.dutch}</dt><dd>{word.arabic}<p lang="nl" dir="ltr">{word.forms}</p></dd></div>)}</dl>
      <h3>عبارات تساعدك في الحوار</h3>
      <ul>{preparation.phrases.map((phrase) => <li key={phrase.dutch}><p lang="nl" dir="ltr">{phrase.dutch}</p><p>{phrase.arabic}</p></li>)}</ul>
      <h3>دروس تساعدك عند الحاجة</h3>
      <ul>{preparation.lessonSlugs.map((slug) => <li key={slug}><Link href={`/learn/${slug}`}>{getLesson(slug)!.title} ←</Link></li>)}</ul>
    </details>
    <p>يمكنك تقسيم التدريب إلى جلستين: القراءة والاستماع أولاً، ثم الكتابة والحوار. إجابات التدريب مؤقتة؛ لا يتتبّع الموقع إنجاز هذه التطبيقات.</p>
    <Link className="text-link" href="/a2-newcomers">اختر موقفاً آخر للقادمين الجدد ←</Link>
  </section>;
}
