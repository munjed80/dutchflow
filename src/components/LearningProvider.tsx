"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { completeLesson, readProgress } from "@/lib/progress";

type User = { id: string; name: string; email: string };
type Snapshot = { enabled: boolean; user: User | null; completedLessons: string[] };
type LearningState = Snapshot & {
  ready: boolean; loading: boolean; error: string; saving: boolean;
  refresh: () => Promise<void>;
  save: (slugs: string[]) => Promise<boolean>;
};
const Context = createContext<LearningState | null>(null);
const unavailable = "تعذّر تحميل الحساب والتقدّم. تحقّق من الاتصال ثم أعد المحاولة.";

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({ enabled: false, user: null, completedLessons: [] });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const generation = useRef(0);
  const busy = useRef(false);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    const request = ++generation.current;
    setLoading(true);
    try {
      const response = await fetch("/api/progress", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data: Snapshot = await response.json();
      if (request !== generation.current) return;
      setSnapshot({ ...data, completedLessons: data.user ? data.completedLessons : readProgress().completedLessons });
      setReady(true);
      setError("");
    } catch {
      if (request === generation.current) { setReady(false); setError(unavailable); }
    } finally { if (request === generation.current) setLoading(false); }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => { generation.current++; window.removeEventListener("focus", onFocus); window.removeEventListener("online", onFocus); };
  }, [refresh]);
  useEffect(() => {
    const update = () => { if (!snapshot.user && ready) setSnapshot((current) => ({ ...current, completedLessons: readProgress().completedLessons })); };
    window.addEventListener("dutchflow-progress", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("dutchflow-progress", update); window.removeEventListener("storage", update); };
  }, [snapshot.user, ready]);

  async function save(slugs: string[]) {
    if (!ready || loading || busy.current) { setError("انتظر تحميل الحساب ثم حاول حفظ التقدّم مجدداً."); return false; }
    if (!snapshot.user) {
      for (const slug of slugs) completeLesson(slug);
      setError("");
      return true;
    }
    busy.current = true;
    setSaving(true);
    const request = ++generation.current;
    try {
      const response = await fetch("/api/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedLessons: slugs, expectedUserId: snapshot.user.id }),
      });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 409 ? "session" : "save");
      const data = await response.json();
      if (request !== generation.current) return false;
      setSnapshot((current) => ({ ...current, completedLessons: data.completedLessons }));
      setError("");
      return true;
    } catch (cause) {
      setError(cause instanceof Error && cause.message === "session"
        ? "انتهت الجلسة أو تغيّر الحساب. افتح صفحة حسابي وسجّل الدخول ثم أعد الحفظ."
        : "لم يُحفظ التقدّم في حسابك. تحقّق من الاتصال ثم أعد الحفظ قبل مغادرة الصفحة.");
      return false;
    } finally { busy.current = false; setSaving(false); }
  }
  return <Context.Provider value={{ ...snapshot, ready, loading, error, saving, refresh, save }}>{children}</Context.Provider>;
}
export function useLearning() {
  const value = useContext(Context);
  if (!value) throw new Error("LearningProvider is required");
  return value;
}
