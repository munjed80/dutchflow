import { getAuth } from "@/lib/server/auth";
import { getDatabase } from "@/lib/server/database";
import { lessons } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const knownSlugs = new Set(lessons.map((lesson) => lesson.slug));
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
async function readCompleted(userId: string) {
  const result = await getDatabase().query<{ lesson_slug: string }>(
    "SELECT lesson_slug FROM learning_progress WHERE user_id = $1 ORDER BY completed_at, lesson_slug", [userId],
  );
  return result.rows.map((row) => row.lesson_slug).filter((slug) => knownSlugs.has(slug));
}
export async function GET(request: Request) {
  try {
    const auth = getAuth();
    if (!auth) return json({ enabled: false, user: null, completedLessons: [] });
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ enabled: true, user: null, completedLessons: [] });
    return json({ enabled: true, user: { id: session.user.id, name: session.user.name, email: session.user.email }, completedLessons: await readCompleted(session.user.id) });
  } catch {
    console.error("Progress read failed");
    return json({ error: "Progress is temporarily unavailable" }, 503);
  }
}
export async function POST(request: Request) {
  try {
    const auth = getAuth();
    if (!auth) return json({ error: "Accounts are unavailable" }, 503);
    // Custom cookie-authenticated mutations require exact origin and JSON.
    if (request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL!).origin) return json({ error: "Invalid origin" }, 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Expected JSON" }, 415);
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return json({ error: "Please sign in again" }, 401);
    // Bound streamed bodies, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Invalid progress" }, 400);
    let raw = "";
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return json({ error: "Body too large" }, 413); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    let body: { completedLessons?: unknown; expectedUserId?: unknown };
    try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid progress" }, 400);
    if (body.expectedUserId !== session.user.id) return json({ error: "Account changed; reload before saving" }, 409);
    const slugs = body.completedLessons;
    if (!Array.isArray(slugs) || slugs.length > knownSlugs.size || !slugs.every((slug) => typeof slug === "string" && knownSlugs.has(slug))) return json({ error: "Invalid lessons" }, 400);
    // Session identity is authoritative. Union-only insert is idempotent across devices.
    if (slugs.length) await getDatabase().query(
      "INSERT INTO learning_progress (user_id, lesson_slug) SELECT $1, unnest($2::text[]) ON CONFLICT (user_id, lesson_slug) DO NOTHING",
      [session.user.id, [...new Set(slugs)]],
    );
    return json({ completedLessons: await readCompleted(session.user.id) });
  } catch {
    console.error("Progress save failed");
    return json({ error: "Progress could not be saved" }, 503);
  }
}
