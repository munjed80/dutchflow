import { knmJson, parseKnmSubmission, readKnmBody } from "@/lib/server/knm/requests";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await readKnmBody(request); if (!body.value) return knmJson({ error: "invalid-body" }, body.status);
  const parsed = parseKnmSubmission(body.value); if (!parsed.result) return knmJson({ error: parsed.status === 409 ? "outdated-version" : "invalid-answers" }, parsed.status);
  return knmJson(parsed.result);
}
