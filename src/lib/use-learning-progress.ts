"use client";
import { useLearning } from "@/components/LearningProvider";
export function useLearningProgress(): string[] {
  return useLearning().completedLessons;
}
