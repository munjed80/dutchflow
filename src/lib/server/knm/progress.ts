import "server-only";
import { getDatabase } from "@/lib/server/database";
import { knmLessonSummaries } from "@/lib/knm/content";
import { knmQuestionIds } from "./bank";
import type { KnmResult } from "@/lib/knm/types";
export async function readKnmAccountProgress(userId: string) {
  const db = getDatabase();
  const [lessons, questions] = await Promise.all([
    db.query<{ lesson_slug: string }>("SELECT lesson_slug FROM knm_completed_lessons WHERE user_id=$1 ORDER BY completed_at, lesson_slug", [userId]),
    db.query<{ question_id: string }>("SELECT question_id FROM knm_question_progress WHERE user_id=$1 AND needs_review=true ORDER BY updated_at, question_id", [userId]),
  ]);
  return { userId, completedLessons: lessons.rows.map((row) => row.lesson_slug).filter((slug) => knmLessonSummaries.some((l) => l.slug === slug)), wrongQuestionIds: questions.rows.map((row) => row.question_id).filter((id) => knmQuestionIds.includes(id)) };
}
export async function saveKnmAccountResult(userId: string, result: KnmResult) {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    if (result.completedLesson) await client.query("INSERT INTO knm_completed_lessons (user_id, lesson_slug) VALUES ($1,$2) ON CONFLICT DO NOTHING", [userId, result.completedLesson]);
    if (result.items.length) await client.query("INSERT INTO knm_question_progress (user_id,question_id,needs_review) SELECT $1, unnest($2::text[]), unnest($3::boolean[]) ON CONFLICT (user_id,question_id) DO UPDATE SET needs_review=EXCLUDED.needs_review, updated_at=now()", [userId, result.items.map((q) => q.id), result.items.map((q) => !q.correct)]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
