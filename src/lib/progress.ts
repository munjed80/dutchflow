const STORAGE_KEY = "dutchflow-progress-v1";

export type LearningProgress = {
  completedLessons: string[];
};

export function readProgress(): LearningProgress {
  if (typeof window === "undefined") return { completedLessons: [] };
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      value &&
      typeof value === "object" &&
      "completedLessons" in value &&
      Array.isArray(value.completedLessons)
    ) {
      return {
        completedLessons: value.completedLessons.filter(
          (slug: unknown): slug is string => typeof slug === "string",
        ),
      };
    }
  } catch {
    // Ignore unavailable or invalid local storage.
  }
  return { completedLessons: [] };
}

export function completeLesson(slug: string): LearningProgress {
  const progress = readProgress();
  const next = {
    completedLessons: [...new Set([...progress.completedLessons, slug])],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The current session still receives the completed result.
  }
  window.dispatchEvent(new Event("dutchflow-progress"));
  return next;
}
