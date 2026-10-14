"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLearning } from "@/components/LearningProvider";
import { applyKnmResult, cleanKnmProgress, KNM_PROGRESS_KEY } from "@/lib/knm/storage";
import type { KnmProgress, KnmResult, KnmSubmission } from "@/lib/knm/types";
const empty: KnmProgress = { completedLessons: [], wrongQuestionIds: [] };
type State = KnmProgress & { ready: boolean; loading: boolean; error: string; userId: string | null; refresh: () => Promise<void>; save: (submission: KnmSubmission, result: KnmResult, owner: string | null) => Promise<boolean>; resetGuest: () => void };
const Context = createContext<State | null>(null);
export function KnmProvider({ children, lessonSlugs, questionIds }: { children: React.ReactNode; lessonSlugs: string[]; questionIds: string[] }) {
  const learning = useLearning();
  const [progress, setProgress] = useState(empty), [ready, setReady] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const generation = useRef(0), ownerRef = useRef<string | null>(null), busy = useRef(false);
  const userId = learning.user?.id ?? null;
  ownerRef.current = userId;
  const refresh = useCallback(async () => {
    if (!learning.ready || learning.loading || learning.error) { setReady(false); setLoading(learning.loading); setError(learning.error); return; }
    const version = ++generation.current; setLoading(true); setReady(false);
    try {
      const response = await fetch("/api/knm/progress", { cache: "no-store" });
      if (!response.ok) throw Error();
      const snapshot = await response.json();
      if (version !== generation.current) return;
      if (snapshot.userId !== userId) throw Error();
      let next: KnmProgress;
      if (userId) {
        const valid = cleanKnmProgress({ ...snapshot, version: 1 }, lessonSlugs, questionIds); if (!valid) throw Error(); next = valid;
      } else {
        const raw = localStorage.getItem(KNM_PROGRESS_KEY);
        const valid = raw ? cleanKnmProgress(JSON.parse(raw), lessonSlugs, questionIds) : empty;
        if (!valid) throw Error(); next = valid;
      }
      setProgress(next); setReady(true); setError("");
    } catch { if (version === generation.current) { setReady(false); setError("تعذّر تحميل تقدّم KNM. أعد المحاولة؛ الدروس والتدريب متاحان."); } }
    finally { if (version === generation.current) setLoading(false); }
  }, [learning.ready, learning.loading, learning.error, userId, lessonSlugs, questionIds]);
  useEffect(() => { void refresh(); return () => { generation.current++; }; }, [refresh]);
  useEffect(() => {
    const update = (event: StorageEvent) => { if (!userId && event.key === KNM_PROGRESS_KEY) void refresh(); };
    const focus = () => { void refresh(); };
    window.addEventListener("storage", update); window.addEventListener("online", focus); window.addEventListener("focus", focus);
    return () => { window.removeEventListener("storage", update); window.removeEventListener("online", focus); window.removeEventListener("focus", focus); };
  }, [refresh, userId]);
  async function save(submission: KnmSubmission, result: KnmResult, owner: string | null) {
    if (!ready || loading || busy.current || owner !== ownerRef.current) return false;
    const version = generation.current; busy.current = true;
    try {
      let next: KnmProgress;
      if (owner) {
        const response = await fetch("/api/knm/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...submission, expectedUserId: owner }) });
        if (!response.ok) throw Error(response.status === 401 || response.status === 409 ? "session" : "save");
        const snapshot = await response.json(); if (snapshot.userId !== owner) throw Error();
        const valid = cleanKnmProgress({ ...snapshot, version: 1 }, lessonSlugs, questionIds); if (!valid) throw Error(); next = valid;
      } else {
        // Read the latest guest state before applying outcomes, including changes from other tabs.
        const raw = localStorage.getItem(KNM_PROGRESS_KEY);
        const previous = raw ? cleanKnmProgress(JSON.parse(raw), lessonSlugs, questionIds) : empty;
        if (!previous) throw Error(); next = applyKnmResult(previous, result);
        localStorage.setItem(KNM_PROGRESS_KEY, JSON.stringify({ version: 1, ...next }));
      }
      if (version !== generation.current || owner !== ownerRef.current) return false;
      setProgress(next); setError(""); return true;
    } catch (cause) {
      if (cause instanceof Error && cause.message === "session") { setReady(false); setError("تغيّرت الجلسة أو نسخة التدريب. أعد تحميل التقدّم، أو الصفحة إذا لزم، قبل محاولة الحفظ."); }
      else setError("لم يُحفظ تقدّم KNM. يمكنك إعادة محاولة الحفظ من نتيجة التدريب.");
      return false;
    }
    finally { busy.current = false; }
  }
  function resetGuest() {
    if (userId || !window.confirm("هل تريد حذف تقدّم KNM ومراجعة الأخطاء من هذا المتصفح؟")) return;
    try { localStorage.removeItem(KNM_PROGRESS_KEY); void refresh(); } catch { setError("تعذّر حذف البيانات من المتصفح."); }
  }
  return <Context.Provider value={{ ...progress, ready, loading, error, userId, refresh: async () => { await learning.refresh(); }, save, resetGuest }}>{children}</Context.Provider>;
}
export function useKnm() { const state = useContext(Context); if (!state) throw Error("KnmProvider is required"); return state; }
