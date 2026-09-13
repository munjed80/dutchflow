import Link from "next/link";
import { lessons } from "@/lib/content";

export default function HomePage() {
  const featuredLessons = lessons.filter((lesson) => ["introductions", "at-the-shop", "doctor-appointment"].includes(lesson.slug));
  return <>
    <section className="hero"><div className="shell hero-grid">
      <div className="hero-copy">
        <span className="eyebrow"><span className="accent-line" /> الهولندية كما تعيشها</span>
        <h1>افهم ما يُقال حولك.<br /><em>وتكلّم بثقة.</em></h1>
        <p>دروس قصيرة تبدأ من المواقف التي تواجهها في هولندا: في العيادة، والمتجر، والعمل. شرح واضح بالعربية، واستماع وتمارين يمكنك البدء بها مجاناً.</p>
        <div className="hero-actions"><Link href="/learn/introductions" className="button button-primary">ابدأ أول درس مجاناً <span aria-hidden="true">←</span></Link><Link href="/placement" className="text-link">اختبر نقطة بدايتك <span aria-hidden="true">↗</span></Link></div>
        <div className="hero-note"><span className="note-symbol">✓</span> الدروس مجانية <span className="note-divider" /> بدون اشتراك شهري</div>
      </div>
      <div className="hero-art" aria-label="مثال على محادثة هولندية مع ترجمتها بالعربية">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-label" lang="nl" dir="ltr">EEN GESPREK BEGINT HIER</div>
        <div className="conversation-card"><div className="conversation-top"><span className="live-dot" /> LES 01 <span className="conversation-pager" dir="ltr">01 / {lessons.length}</span></div>
          <span className="conversation-icon" aria-hidden="true">“</span>
          <p lang="nl" dir="ltr">Hoe gaat het<br />met u?</p><span className="conversation-translation">كيف حالك؟</span>
          <div className="conversation-bottom"><span>موقف يومي · التعارف</span><span className="sound-wave" aria-hidden="true">▂ ▅ ▃ ▆ ▃</span></div>
        </div>
        <div className="art-caption">من أول جملة إلى أول محادثة.</div>
      </div>
    </div></section>

    <section className="feature-strip"><div className="shell feature-strip-inner"><span>من الصفر إلى أول محادثة</span><span className="strip-separator" /><span>تعلم من مواقف حقيقية</span><span className="strip-separator" /><span>استمع · افهم · طبّق</span></div></section>

    <section className="shell home-section" id="how-it-works"><div className="section-heading"><div><span className="eyebrow">طريقة التعلّم</span><h2>خطوات صغيرة. تقدّم حقيقي.</h2></div><p>كل درس يضع اللغة في سياق تستطيع استخدامه اليوم، دون أن يغرقك بالقواعد من البداية.</p></div>
      <div className="method-grid"><article className="method-card"><span className="method-number">01</span><h3>افهم الموقف</h3><p>اعرف ما الذي تريد قوله، وأين ستحتاج هذه الجملة في حياتك.</p></article><article className="method-card"><span className="method-number">02</span><h3>استمع وكرّر</h3><p>استمع إلى الجمل الهولندية بالسرعة العادية أو البطيئة واقرأ شرحها بالعربية.</p></article><article className="method-card"><span className="method-number">03</span><h3>تدرّب وتقدّم</h3><p>أجب عن أسئلة قصيرة، ثم انتقل إلى الموقف التالي عندما تتقن الدرس.</p></article></div>
    </section>

    <section className="lessons-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ابدأ من هنا · A1</span><h2>أول مواقف ستواجهها</h2></div><Link className="text-link" href="/learn">كل الدروس <span aria-hidden="true">←</span></Link></div>
      <div className="lesson-grid">{featuredLessons.map((lesson) => <Link className="lesson-tile" href={`/learn/${lesson.slug}`} key={lesson.slug}>
        <div className="lesson-tile-top"><span className="level-badge">{lesson.level}</span><span>{lesson.durationMinutes} دقائق</span></div><span className="lesson-tile-number">{lesson.number}</span><h3>{lesson.title}</h3><p lang="nl" dir="ltr">{lesson.dutchTitle}</p><span className="tile-footer">ابدأ الدرس <span aria-hidden="true">←</span></span>
      </Link>)}</div>
    </div></section>

    <section className="shell pricing-section"><div className="pricing-copy"><span className="eyebrow">بسيطة وواضحة</span><h2>تعلّم مجاناً.<br />ادفع فقط لتختبر نفسك.</h2><p>جميع الدروس والتدريبات الأساسية مجانية. الامتحانات التدريبية الكاملة ستكون اختيارية، بسعر واضح لكل محاولة عند تفعيلها.</p><Link className="text-link" href="/exams">استكشف الامتحانات <span aria-hidden="true">←</span></Link></div><div className="pricing-card"><span className="price-kicker">امتحان تدريبي كامل</span><div className="price" dir="ltr">€4.95 <small>/ attempt</small></div><div className="pricing-rule" /><p>أسئلة في القراءة والاستماع والمفردات، مع تحليل للنتيجة ودروس للمراجعة عند إطلاق الامتحانات المدفوعة.</p><span className="coming-soon">قيد الإعداد</span></div></section>
  </>;
}
