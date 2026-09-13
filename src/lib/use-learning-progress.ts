"use client";

import { useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

export function useLearningProgress() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setCompletedLessons(readProgress().completedLessons);
    sync();
    window.addEventListener("dutchflow-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("dutchflow-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return completedLessons;
}
