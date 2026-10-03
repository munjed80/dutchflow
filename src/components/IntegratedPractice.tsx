import { getQuestionReviewLessons } from "@/lib/practice-review";
import Link from "next/link";
import { ReadingQuiz } from "@/components/ReadingQuiz";
import { PassageListening } from "@/components/PassageListening";
import { ProductionPractice } from "@/components/ProductionPractice";

import { getCurriculum } from "@/lib/curriculum";
import { levelHref, practiceHref, curriculumHref, type CourseLevel } from "@/lib/levels";
import type { PracticePack } from "@/lib/a1-practice";

export function IntegratedPractice({ pack, nextPack, level }: { pack: PracticePack; nextPack?: PracticePack; level: CourseLevel }) {
  const { slug } = pack;
  const curriculum = getCurriculum(level);
  const base = practiceHref(level);
  return <div className="shell inner-page practice-page">
    <div className="breadcrumb"><Link href={base}>مراجعات {level}</Link><span> / {pack.title}</span></div>
    <div className="page-heading"><span className="eyebrow">تدريب مجاني · استخدم بيانات خيالية</span><h1>{pack.title}</h1><p>ابدأ دون النماذج، ثم راجع الفهم والتعبير. لا تُحفظ إجاباتك ولا تتغير علامة إنجاز الدروس.</p></div>
    <nav className="curriculum-index" aria-label="مهارات المراجعة"><a href="#read">القراءة</a><a href="#listen">الاستماع</a><a href="#write">الكتابة</a><a href="#speak">التحدث</a></nav>
    <section id="read"><h2>١. اقرأ معلومات جديدة</h2><div className="panel"><p className="practice-source" lang="nl" dir="ltr">{pack.reading.text}</p>
      {pack.reading.table && <div className="practice-table"><table lang="nl" dir="ltr"><caption>{pack.reading.table.caption}</caption><thead><tr>{pack.reading.table.headers.map((head) => <th scope="col" key={head}>{head}</th>)}</tr></thead><tbody>{pack.reading.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>}
      <details><summary>اعرض ترجمة القراءة</summary><p>{pack.reading.translation}</p></details></div>
      <ReadingQuiz key={`${slug}-reading`} questions={pack.reading.questions} reviewLessons={getQuestionReviewLessons(pack.reading.questions)} />
    </section>
    <div id="listen"><PassageListening key={slug} passage={pack.listening} reviewLessons={getQuestionReviewLessons(pack.listening.questions)} /></div>
    <section id="write"><h2>٣. اكتب في مواقف جديدة</h2><ProductionPractice key={slug} tasks={pack.writing} /></section>
    <section id="speak" className="panel speaking-practice"><h2>٤. تحدث وتبادل الأدوار</h2><p>تحدث بصوتك مع شريك أو معلّم، ثم بدّلا الأدوار. إذا كنت وحدك، قل الإجابة قبل فتح المثال. لا يُسجّل صوتك ولا يُمنح تقييم للنطق.</p>
      {slug === "travel-and-directions" && <figure className="practice-map"><svg viewBox="0 0 520 320" role="img" aria-labelledby="map-title" aria-describedby="map-desc" lang="nl" style={{ direction: "ltr" }}><title id="map-title">Oefenkaart: van Halte naar School</title><desc id="map-desc">Halte ligt onderaan. Een straat loopt omhoog tot een kruispunt. Links ligt Park, rechts ligt School. Ga vanaf Halte rechtdoor en dan rechtsaf naar School.</desc><path d="M260 270 V100 M70 100 H450" stroke="#c6c9c0" strokeWidth="34" fill="none"/><path d="M260 270 V100 M70 100 H450" stroke="#fff" strokeWidth="2" strokeDasharray="8 8" fill="none"/><circle cx="260" cy="270" r="9" fill="#315b49"/><text x="260" y="307" textAnchor="middle">Halte · start</text><text x="55" y="60">Park</text><text x="400" y="60">School</text><text x="290" y="160">Kruispunt</text><text x="20" y="270">↑ Noord</text></svg><figcaption>خريطة خيالية: ابدأ من المحطة واتجه نحو أعلى الخريطة.</figcaption></figure>}
      {pack.speaking.map((task, index) => <div className="panel production-task speaking-task" key={task.prompt}>
        <h3>{index + 1}. {task.prompt}</h3>
        <p className="quiet">اطلب من الشريك تحديد معلومة فهمها، ومعلومة تحتاج إلى توضيح. أعد الحديث ببيانات جديدة بعد كل محاولة.</p>
        <h4>أسئلة الشريك</h4>
        <ul>{task.partnerPrompts.map((prompt) => <li key={prompt} lang="nl" dir="ltr">{prompt}</li>)}</ul>
        <details><summary>راجع مثالاً ومعايير الحديث</summary><p lang="nl" dir="ltr">{task.model}</p><p>{task.translation}</p><ul>{task.checklist.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul><p>هذه مراجعة ذاتية وليست إثباتاً لإتقان المستوى.</p></details>
      </div>)}
    </section>
    <section className="panel"><h2>ماذا تراجع بعد المحاولة؟</h2><p>ارجع إلى الدروس المرتبطة بالأخطاء، وجرّب الكتابة والحديث مجدداً بأسماء وأوقات أخرى. لا توجد درجة نجاح موحدة لهذه المراجعة.</p><ul>{pack.unitIds.map((id) => <li key={id}><Link href={`${curriculumHref(level)}#${id}`}>{curriculum.find((unit) => unit.id === id)!.title} ←</Link></li>)}</ul><Link href={levelHref("/grammar", level)}>مرجع القواعد ←</Link></section>
    <nav className="reading-related" aria-label={`التنقل بين مراجعات ${level}`}>
      {nextPack && <Link className="next-lesson" href={`${base}/${nextPack.slug}`}>المراجعة التالية: {nextPack.title} ←</Link>}
      <Link className="text-link" href={base}>كل مراجعات {level} ←</Link>
    </nav>
  </div>;
}
