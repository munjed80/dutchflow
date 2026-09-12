import Link from "next/link";

export default function NotFound() {
  return <div className="shell inner-page empty-state"><span className="eyebrow">404 · صفحة غير موجودة</span><h1>لم نجد هذه الصفحة.</h1><Link href="/learn" className="button button-primary">العودة إلى الدروس ←</Link></div>;
}
