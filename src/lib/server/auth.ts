import "server-only";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { getDatabase } from "./database";

export function accountsEnabled() {
  const { DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, SMTP_URL, EMAIL_FROM } = process.env;
  if (!DATABASE_URL || !BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32 || !BETTER_AUTH_URL || !SMTP_URL || !EMAIL_FROM) return false;
  try {
    const url = new URL(BETTER_AUTH_URL);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch { return false; }
}

function createAuth() {
  const smtp = new URL(process.env.SMTP_URL!);
  if (!["smtp:", "smtps:"].includes(smtp.protocol)) throw new Error("Invalid SMTP URL");
  const mail = nodemailer.createTransport({
    host: smtp.hostname,
    port: Number(smtp.port || (smtp.protocol === "smtps:" ? 465 : 587)),
    secure: smtp.protocol === "smtps:",
    requireTLS: !["localhost", "127.0.0.1"].includes(smtp.hostname),
    auth: smtp.username ? { user: decodeURIComponent(smtp.username), pass: decodeURIComponent(smtp.password) } : undefined,
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  return betterAuth({
    appName: "DutchFlow",
    baseURL: process.env.BETTER_AUTH_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    database: getDatabase(),
    trustedOrigins: [new URL(process.env.BETTER_AUTH_URL!).origin],
    logger: { disabled: true },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 100 },
    advanced: { ipAddress: { ipAddressHeaders: [process.env.AUTH_IP_HEADER || "x-real-ip"] } },
    plugins: [magicLink({
      expiresIn: 600,
      storeToken: "hashed",
      rateLimit: { window: 60, max: 5 },
      async sendMagicLink({ email, url }) {
        // The same flow serves new and existing users. Never log the link or recipient.
        await mail.sendMail({
          from: process.env.EMAIL_FROM!, to: email,
          subject: "رابط الدخول إلى DutchFlow",
          text: `مرحباً!\n\nافتح هذا الرابط للدخول إلى DutchFlow:\n${url}\n\nالرابط صالح لمدة 10 دقائق ولمرة واحدة. إذا لم تطلبه، تجاهل الرسالة.`,
        });
      },
    })],
  });
}
let auth: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!accountsEnabled()) return null;
  return auth ??= createAuth();
}
