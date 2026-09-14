"use client";

import { useEffect, useRef, useState } from "react";
import audioManifest from "@/lib/audio-manifest.json";
import { playAudio, type AudioSpeed, type AudioVoice, type PlaybackState } from "@/lib/audio-playback";

type AudioManifest = Record<string, Partial<Record<AudioVoice, Partial<Record<AudioSpeed, string>>>>>;

export function AudioButton({ id, text, concealText = false, onPlaybackComplete }: {
  id: string; text: string; concealText?: boolean; onPlaybackComplete?: () => void;
}) {
  const manifest = audioManifest as AudioManifest;
  const availableVoices = (["female", "male"] as const).filter((voice) => manifest[id]?.[voice]?.normal || manifest[id]?.[voice]?.slow);
  const [voice, setVoice] = useState<AudioVoice>(availableVoices[0] ?? "female");
  const [state, setState] = useState<PlaybackState>({ status: "idle" });
  const stop = useRef<(() => void) | undefined>(undefined);
  const mounted = useRef(false);
  const completed = useRef(onPlaybackComplete);
  completed.current = onPlaybackComplete;

  useEffect(() => {
    mounted.current = true;
    // Some engines load their voice list only after this first request.
    try { if ("speechSynthesis" in window) window.speechSynthesis.getVoices(); } catch { /* Report failures only when playback is requested. */ }
    return () => { mounted.current = false; stop.current?.(); };
  }, [id, text]);

  function play(speed: AudioSpeed) {
    stop.current = playAudio({ path: manifest[id]?.[voice]?.[speed], text, speed, voice,
      onState: (next) => { if (mounted.current) setState(next); },
      onComplete: () => { if (mounted.current) completed.current?.(); },
    });
  }
  return <div className="audio-control">
    <div className="audio-buttons">
      <button type="button" className="audio-button" onClick={() => play("normal")} aria-label={concealText ? "استمع إلى الجملة" : `استمع إلى ${text}`}><span aria-hidden="true">◖))</span> استمع</button>
      <button type="button" className="audio-button audio-button-muted" onClick={() => play("slow")} aria-label={concealText ? "استمع ببطء إلى الجملة" : `استمع ببطء إلى ${text}`}>ببطء</button>
      {availableVoices.length > 1 && <button type="button" className="audio-button audio-button-muted" onClick={() => { stop.current?.(); setVoice(voice === "female" ? "male" : "female"); }} aria-label="تغيير الصوت">{voice === "female" ? "صوت امرأة" : "صوت رجل"}</button>}
      {state.status !== "idle" && <button type="button" className="audio-button audio-button-muted" onClick={() => stop.current?.()}>إيقاف الصوت</button>}
    </div>
    {state.status !== "idle" && <span className="audio-status" role="status">{state.status === "loading" ? "جارٍ تجهيز الصوت…" : state.source === "device" ? "يُشغّل بنطق الجهاز" : "يُشغّل ملف الدرس"}</span>}
    {state.error && <span className="audio-error" role="status">{state.error}</span>}
  </div>;
}
