"use client";

import { useState } from "react";
import audioManifest from "@/lib/audio-manifest.json";

type Speed = "normal" | "slow";
type Voice = "female" | "male";
type AudioManifest = Record<string, Record<Voice, Record<Speed, string>>>;

let activeAudio: HTMLAudioElement | undefined;

export function AudioButton({ id, text }: { id: string; text: string }) {
  const [voice, setVoice] = useState<Voice>("female");
  const [error, setError] = useState("");
  const manifest = audioManifest as AudioManifest;
  const hasRecordedAudio = Boolean(manifest[id]?.[voice]?.normal);

  function useDeviceVoice(speed: Speed) {
    if (!("speechSynthesis" in window)) {
      setError("الصوت غير متاح في هذا المتصفح حالياً.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = speed === "slow" ? 0.72 : 0.95;
    const voices = window.speechSynthesis.getVoices();
    const dutchVoices = voices.filter((item) => item.lang.toLowerCase().startsWith("nl"));
    utterance.voice = dutchVoices.find((item) =>
      voice === "female" ? /female|vrouw|colette|fenna/i.test(item.name) : /male|man|maarten/i.test(item.name),
    ) ?? dutchVoices[0] ?? null;
    utterance.onerror = () => setError("تعذّر تشغيل الصوت على هذا الجهاز.");
    window.speechSynthesis.speak(utterance);
  }

  async function play(speed: Speed) {
    setError("");
    activeAudio?.pause();
    const path = manifest[id]?.[voice]?.[speed];
    if (path) {
      try {
        activeAudio = new Audio(path);
        await activeAudio.play();
        return;
      } catch {
        // A missing cached file should not prevent the learner from listening.
      }
    }
    useDeviceVoice(speed);
  }

  return (
    <div className="audio-control">
      <div className="audio-buttons">
        <button type="button" className="audio-button" onClick={() => void play("normal")} aria-label={`استمع إلى ${text}`}>
          <span aria-hidden="true">◖))</span> استمع
        </button>
        <button type="button" className="audio-button audio-button-muted" onClick={() => void play("slow")} aria-label={`استمع ببطء إلى ${text}`}>
          ببطء
        </button>
        {hasRecordedAudio && (
          <button type="button" className="audio-button audio-button-muted" onClick={() => setVoice(voice === "female" ? "male" : "female")}>
            {voice === "female" ? "صوت امرأة" : "صوت رجل"}
          </button>
        )}
      </div>
      {error && <span className="audio-error" role="status">{error}</span>}
    </div>
  );
}
