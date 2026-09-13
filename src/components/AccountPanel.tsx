"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { readProgress } from "@/lib/progress";
import { useLearning } from "./LearningProvider";

export function AccountPanel({ knownSlugs }: { knownSlugs: string[] }) {
  const learning = useLearning();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [localSlugs, setLocalSlugs] = useState<string[]>([]);
  useEffect(() => {
    setLocalSlugs([...new Set(readProgress().completedLessons)].filter((slug) => knownSlugs.includes(slug)));
    if (new URLSearchParams(window.location.search).has("error")) setFailure("رابط الدخول غير صالح أو انتهت مدته. اطلب رابطاً جديداً.");
  }, [knownSlugs]);
  const missing = localSlugs.filter((slug) => !learning.completedLessons.includes(slug));

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setFailure(""); setMessage("");
    try {
      const { error } = await authClient.signIn.magicLink({ email: email.trim(), name: name.trim(), callbackURL: "/account", errorCallbackURL: "/account" });
      if (error) { setFailure(error.status === 429 ? "طلبات كثيرة. انتظر دقيقة ثم حاول مجدداً." : "تعذّر إرسال الرابط. تحقّق من البريد وحاول مجدداً."); }
      else setMessage("تحقّق من بريدك، بما فيه مجلد الرسائل غير المرغوب فيها. رابط الدخول صالح لمدة 10 دقائق ولمرة واحدة.");
    } catch { setFailure("تعذّر الاتصال. حاول مجدداً."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setFailure("");
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error();
      window.location.assign("/account");
    } catch { setFailure("تعذّر تسجيل الخروج. حاول مجدداً."); setBusy(false); }
  }

  if (learning.loading && !learning.ready) return <div className="panel account-card" role="status">جارٍ تحميل الحساب…</div>;
  return <div className="panel account-card">
    {learning.error && <div role="alert"><p>{learning.error}</p><button className="button button-secondary" onClick={() => void learning.refresh()} disabled={learning.loading}>أعد تحميل الحساب</button></div>}
    {failure && <p role="alert" className="retry-message">{failure}</p>}
    {message && <p role="status" className="success-message">{message}</p>}
    {learning.ready && learning.user ? <>
      <span className="eyebrow">حسابك المجاني</span>
      <h2>مرحباً، {learning.user.name || "متعلّم"}</h2>
      <p className="account-email" dir="ltr">{learning.user.email}</p>
      <p>يُحفظ تقدّمك في حسابك لتتابع التعلّم من أي جهاز بعد تسجيل الدخول.</p>
      {missing.length > 0 && <div className="import-progress">
        <h3>هل تريد إضافة تقدّم هذا الجهاز؟</h3>
        <p>يوجد {missing.length} من الدروس المكتملة محلياً غير موجودة في حسابك. أضفها فقط إذا كان هذا التقدّم يخصك.</p>
        <button className="button button-secondary" disabled={learning.saving || busy} onClick={async () => {
          setMessage("");
          if (await learning.save(missing)) setMessage("أُضيف تقدّم هذا الجهاز إلى حسابك. تبقى النسخة المحلية محفوظة.");
        }}>{learning.saving ? "جارٍ الحفظ…" : "أضف تقدّم هذا الجهاز إلى حسابي"}</button>
      </div>}
      <div className="account-actions"><Link className="button button-primary" href="/progress">شاهد تقدّمك</Link><button className="button button-secondary" disabled={busy || learning.saving} onClick={signOut}>تسجيل الخروج</button></div>
      <p className="quiet">على الأجهزة المشتركة، سجّل الخروج عند الانتهاء. تقدّم الحساب لا يُنسخ إلى وضع الزائر.</p>
    </> : learning.ready && learning.enabled ? <>
      <span className="eyebrow">تعلّم من أي جهاز</span>
      <h2>الدخول أو إنشاء حساب</h2>
      <p>أدخل بريدك لنرسل لك رابط دخول. إذا كانت هذه زيارتك الأولى، سننشئ حسابك عند فتح الرابط.</p>
      <form className="account-form" onSubmit={signIn}>
        <label htmlFor="account-name">اسمك <span className="quiet">(اختياري)</span></label>
        <input id="account-name" autoComplete="given-name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
        <label htmlFor="account-email">البريد الإلكتروني</label>
        <input id="account-email" type="email" dir="ltr" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} />
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "جارٍ إرسال الرابط…" : "أرسل رابط الدخول"}</button>
      </form>
      <p className="quiet">نستخدم بريدك للدخول، ونحفظ اسمك وتقدّم الدروس في حسابك. الدروس مجانية دائماً ويمكنك التعلّم دون حساب.</p>
    </> : learning.ready ? <><h2>الحسابات غير متاحة حالياً</h2><p>يمكنك متابعة الدروس مجاناً؛ سيبقى تقدّم الزائر محفوظاً على هذا الجهاز.</p></> : null}
    <Link className="text-link" href="/learn">تابع الدروس المجانية ←</Link>
  </div>;
}
