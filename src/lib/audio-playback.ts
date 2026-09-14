export type AudioSpeed = "normal" | "slow";
export type AudioVoice = "female" | "male";
export type PlaybackState = { status: "idle" | "loading" | "playing"; source?: "recorded" | "device"; error?: string };

let stopActive: (() => void) | undefined;

// One owner across every player. Stale media events must never complete another round.
export function playAudio({ path, text, speed, voice, onState, onComplete }: {
  path?: string; text: string; speed: AudioSpeed; voice: AudioVoice;
  onState: (state: PlaybackState) => void; onComplete?: () => void;
}): () => void {
  stopActive?.();
  let active = true;
  let audio: HTMLAudioElement | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let fallbackStarted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function release() {
    if (timer) clearTimeout(timer);
    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); }
    if (utterance) {
      utterance.onstart = null; utterance.onend = null; utterance.onerror = null;
      window.speechSynthesis.cancel();
    }
    if (stopActive === stop) stopActive = undefined;
  }
  function finish(error?: string, completed = false) {
    if (!active) return;
    active = false; release(); onState({ status: "idle", ...(error ? { error } : {}) });
    if (completed) onComplete?.();
  }
  function stop() { finish(); }
  stopActive = stop;
  onState({ status: "loading" });
  // Recover from engines which never send a start/end event. Phrases are short.
  timer = setTimeout(() => finish("استغرق تشغيل الصوت وقتاً طويلاً. حاول مجدداً."), 30000);

  function useDeviceVoice() {
    if (!active || fallbackStarted) return;
    fallbackStarted = true;
    if (audio) { audio.onended = null; audio.onerror = null; audio.pause(); }
    try {
      if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        finish("الصوت غير متاح في هذا المتصفح حالياً."); return;
      }
      const voices = window.speechSynthesis.getVoices().filter((item) => /^nl(?:-|$)/i.test(item.lang));
      const selected = voices.find((item) => voice === "female"
        ? /\bfemale\b|vrouw|colette|fenna/i.test(item.name)
        : /\bmale\b|\bman\b|maarten/i.test(item.name)) ?? voices[0];
      if (!selected) { finish("لا يتوفر صوت هولندي على جهازك حالياً. أعد المحاولة بعد تحميل الأصوات أو استخدم جهازاً آخر."); return; }
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "nl-NL"; utterance.voice = selected;
      utterance.rate = speed === "slow" ? 0.72 : 0.95;
      utterance.onstart = () => { if (active) onState({ status: "playing", source: "device" }); };
      utterance.onend = () => finish(undefined, true);
      utterance.onerror = () => finish("تعذّر تشغيل الصوت على هذا الجهاز. حاول مجدداً.");
      onState({ status: "loading", source: "device" });
      window.speechSynthesis.speak(utterance);
    } catch { finish("تعذّر تشغيل الصوت على هذا الجهاز. حاول مجدداً."); }
  }

  if (path) {
    try {
      audio = new Audio(path);
      audio.onended = () => { if (!fallbackStarted) finish(undefined, true); };
      audio.onerror = useDeviceVoice;
      void audio.play().then(() => {
        if (!active) audio?.pause();
        else if (!fallbackStarted) onState({ status: "playing", source: "recorded" });
      }).catch(useDeviceVoice);
    } catch { useDeviceVoice(); }
  } else useDeviceVoice();
  return stop;
}
