import { publicKnmQuestions, selectKnmQuestions } from "@/lib/server/knm/bank";
import { knmJson } from "@/lib/server/knm/requests";
import { knmCurriculum } from "@/lib/knm/content";
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  if (raw.length > 3000) return knmJson({ error: "invalid-selection" }, 400);
  const questions = selectKnmQuestions({ mode: "review", key: "mistakes", questionIds: raw.split(",") });
  return questions ? knmJson({ revision: knmCurriculum.revision, questions: publicKnmQuestions(questions) }) : knmJson({ error: "invalid-selection" }, 400);
}
