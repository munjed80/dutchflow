import { KnmReview } from "@/components/knm/KnmReview";
export const metadata={title:"مراجعة أخطاء KNM"};
export default function KnmReviewPage(){return <><header className="page-heading"><span className="eyebrow">افهم السبب ثم أعد المحاولة</span><h1>حوّل الخطأ <em>إلى معرفة.</em></h1><p>راجع الأسئلة غير الصحيحة والمتروكة. بعد المحاولة يظهر التفسير والدرس المرتبط بكل سؤال.</p></header><KnmReview/></>;}
