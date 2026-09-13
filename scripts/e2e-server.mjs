// Test-only infrastructure. No inbox endpoint or embedded database is part of the app.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { SMTPServer } from "smtp-server";
import { migrate } from "./migrate.mjs";

let db, socketServer;
const databaseURL = process.env.TEST_DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5439/postgres";
if (!process.env.TEST_DATABASE_URL) {
  const { PGlite } = await import("@electric-sql/pglite");
  const { PGLiteSocketServer } = await import("@electric-sql/pglite-socket");
  db = await PGlite.create();
  socketServer = new PGLiteSocketServer({ db, port: 5439, host: "127.0.0.1", maxConnections: 20 });
  await socketServer.start();
}
await migrate(databaseURL);
await migrate(databaseURL); // A second run must be a no-op.
const messages = new Map();
const smtp = new SMTPServer({
  authOptional: true, disabledCommands: ["STARTTLS"], logger: false,
  onData(stream, session, callback) {
    let raw = "";
    stream.on("data", (chunk) => { raw += chunk.toString(); });
    stream.on("end", () => {
      // Nodemailer sends quoted-printable text; decode only for this private test inbox.
      const decoded = raw.replace(/=\r?\n/g, "").replace(/=([A-F0-9]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      const url = decoded.match(/http:\/\/127\.0\.0\.1:3100\/api\/auth\/magic-link\/verify[^\s]+/)?.[0];
      for (const recipient of session.envelope.rcptTo) messages.set(recipient.address, url || null);
      callback();
    });
  },
});
await new Promise((resolve) => smtp.listen(3025, "127.0.0.1", resolve));
const inbox = createServer((request, response) => {
  const email = new URL(request.url, "http://127.0.0.1:3026").searchParams.get("email");
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ url: messages.get(email) || null }));
});
await new Promise((resolve) => inbox.listen(3026, "127.0.0.1", resolve));
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3100"], {
  stdio: "inherit", env: { ...process.env,
    DATABASE_URL: databaseURL,
    BETTER_AUTH_URL: "http://127.0.0.1:3100",
    BETTER_AUTH_SECRET: "test-only-dutchflow-secret-never-use-in-production-2026",
    SMTP_URL: "smtp://127.0.0.1:3025", EMAIL_FROM: "DutchFlow <test@dutchflow.example>",
  },
});
async function stop() {
  child.kill("SIGTERM");
  inbox.close(); smtp.close();
  if (socketServer) await socketServer.stop();
  if (db) await db.close();
}
process.on("SIGTERM", () => { void stop(); });
process.on("SIGINT", () => { void stop(); });
child.on("exit", (code) => { void stop().finally(() => process.exit(code ?? 0)); });
