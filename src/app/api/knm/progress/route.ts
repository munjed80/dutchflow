import { getAuth } from "@/lib/server/auth";
import { knmJson, parseKnmSubmission, readKnmBody } from "@/lib/server/knm/requests";
import { readKnmAccountProgress, saveKnmAccountResult } from "@/lib/server/knm/progress";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const session = await getAuth()?.api.getSession({ headers: request.headers });
    return session ? knmJson(await readKnmAccountProgress(session.user.id)) : knmJson({ userId: null, completedLessons: [], wrongQuestionIds: [] });
  } catch { return knmJson({ error: "progress-unavailable" }, 503); }
}
export async function POST(request: Request) {
  try {
    const auth = getAuth(); if (!auth) return knmJson({ error: "accounts-unavailable" }, 503);
    if (request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL!).origin) return knmJson({ error: "invalid-origin" }, 403);
    const session = await auth.api.getSession({ headers: request.headers }); if (!session) return knmJson({ error: "session-expired" }, 401);
    const body = await readKnmBody(request); if (!body.value) return knmJson({ error: "invalid-body" }, body.status);
    if (body.value.expectedUserId !== session.user.id) return knmJson({ error: "account-changed" }, 409);
    const parsed = parseKnmSubmission(body.value, true); if (!parsed.result) return knmJson({ error: "invalid-submission" }, parsed.status);
    await saveKnmAccountResult(session.user.id, parsed.result);
    return knmJson(await readKnmAccountProgress(session.user.id));
  } catch { return knmJson({ error: "save-failed" }, 503); }
}
