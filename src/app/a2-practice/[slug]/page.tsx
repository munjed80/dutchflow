import { notFound } from "next/navigation";
import { IntegratedPractice } from "@/components/IntegratedPractice";
import { practicePacks } from "@/lib/a2-practice";
export function generateStaticParams() { return practicePacks.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: practicePacks.find((pack) => pack.slug === slug)?.title ?? "المراجعة غير موجودة" };
}
export default async function PracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = practicePacks.find((item) => item.slug === slug);
  if (!pack) notFound();
  return <IntegratedPractice pack={pack} nextPack={practicePacks[practicePacks.indexOf(pack) + 1]} level="A2" />;
}
