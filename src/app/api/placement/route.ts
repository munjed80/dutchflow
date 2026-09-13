import { placementBank } from "@/lib/server/placement";
import { gradePlacement, validAnswers } from "@/lib/placement-scoring";

export const runtime = "nodejs";
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return json({ error: "invalid-body" }, 415);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "invalid-body" }, 400);
  let size = 0;
  let raw = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return json({ error: "body-too-large" }, 413); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return json({ error: "invalid-body" }, 400); }
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json({ error: "invalid-body" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "invalid-body" }, 400);
  const submission = body as Record<string, unknown>;
  if (Object.keys(submission).some((key) => !["revision", "answers"].includes(key))) return json({ error: "invalid-body" }, 400);
  if (submission.revision !== placementBank.revision) return json({ error: "outdated-version" }, 409);
  if (!validAnswers(submission.answers, placementBank)) return json({ error: "invalid-answers" }, 400);
  // Stateless free practice: no identity, purchase, completion, or client-provided score is used.
  return json(gradePlacement(placementBank, submission.answers));
}
