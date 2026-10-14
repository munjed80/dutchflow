import { notFound } from "next/navigation";
import { knmCurriculum } from "@/lib/knm/content";
import { publicKnmQuestions, selectKnmQuestions } from "@/lib/server/knm/bank";
import { KnmQuiz } from "@/components/knm/KnmQuiz";
export function generateStaticParams(){ return knmCurriculum.exams.map(({slug})=>({slug})); }
export const metadata = {title:"KNM — امتحان تدريبي"};
export default async function KnmExam({params}:{params:Promise<{slug:string}>}) { const slug=(await params).slug; const current=knmCurriculum.exams.find((e)=>e.slug===slug); if(!current)notFound(); const selection={mode:"exam" as const,key:slug}; return <><header className="page-heading"><span className="eyebrow">KNM · تدريب مستقل</span><h1>{current.title}</h1><p>المعرفة أولاً. اقرأ السؤال واختر جواباً واحداً، ثم راجع الأسباب بعد التسليم.</p></header><KnmQuiz key={slug} selection={selection} questions={publicKnmQuestions(selectKnmQuestions(selection)!)} revision={knmCurriculum.revision} minutes={current.minutes}/></>; }
