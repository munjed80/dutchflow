import { getAuth } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  try {
    const auth = getAuth();
    if (!auth) return Response.json({ error: "Accounts are unavailable" }, { status: 503 });
    const response = await auth.handler(request);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Referrer-Policy", "no-referrer");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch {
    console.error("Authentication request failed");
    return Response.json({ error: "Please try again later" }, { status: 503 });
  }
}
export { handle as GET, handle as POST };
