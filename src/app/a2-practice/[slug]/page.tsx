import { newcomerPath, getNewcomerPreparation } from "@/lib/a2-newcomers";
import { NewcomerPreparation } from "@/components/NewcomerPreparation";
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
  const preparation = getNewcomerPreparation(slug);
  const sequence = preparation
    ? newcomerPath.map((item) => practicePacks.find((candidate) => candidate.slug === item.slug)!)
    : practicePacks.filter((item) => !getNewcomerPreparation(item.slug));
  return <IntegratedPractice pack={pack} nextPack={sequence[sequence.indexOf(pack) + 1]} level="A2"
    preparation={preparation ? <NewcomerPreparation preparation={preparation} /> : undefined} />;
}
