import "server-only";
import { knmCurriculum } from "@/lib/knm/content";
import { selectKnmQuestions } from "./bank";
import { gradeKnm, validKnmAnswers } from "@/lib/knm/scoring";
import type { KnmSubmission } from "@/lib/knm/types";
export function knmJson(value: unknown, status = 200) { return Response.json(value, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } }); }
export async function readKnmBody(request: Request): Promise<{ value?: Record<string, unknown>; status?: number }> {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return { status: 415 };
  const reader = request.body?.getReader(); if (!reader) return { status: 400 };
  let raw = "", size = 0; const decoder = new TextDecoder();
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 16384) { await reader.cancel(); return { status: 413 }; } raw += decoder.decode(value, { stream: true }); } raw += decoder.decode();
    const value = JSON.parse(raw); if (!value || typeof value !== "object" || Array.isArray(value)) return { status: 400 }; return { value };
  } catch { return { status: 400 }; }
}
export function parseKnmSubmission(body: Record<string, unknown>, account = false) {
  const allowed = ["revision", "mode", "key", "answers", "questionIds", ...(account ? ["expectedUserId"] : [])];
  if (Object.keys(body).some((k) => !allowed.includes(k))) return { status: 400 as const };
  if (body.revision !== knmCurriculum.revision) return { status: 409 as const };
  if (!["lesson", "exam", "review"].includes(String(body.mode)) || typeof body.key !== "string") return { status: 400 as const };
  if (body.mode !== "review" && body.questionIds !== undefined) return { status: 400 as const };
  const submission = body as unknown as KnmSubmission;
  const questions = selectKnmQuestions(submission);
  if (!questions || !validKnmAnswers(body.answers, questions)) return { status: 400 as const };
  return { submission, result: gradeKnm(questions, body.answers, body.mode === "lesson" ? body.key : null) };
}
