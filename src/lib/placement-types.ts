export type PlacementSkill = { id: string; title: string };
export type PlacementQuestion = {
  id: string; skill: string; prompt: string; passage?: string;
  options: string[]; optionLanguage: "nl" | "ar";
};
export type PlacementQuestionKey = PlacementQuestion & {
  correctIndex: number; explanation: string; lessonSlug: string;
};
export type PlacementBank = {
  revision: string; skills: PlacementSkill[]; questions: PlacementQuestionKey[];
};
export type PublicPlacement = Omit<PlacementBank, "questions"> & { questions: PlacementQuestion[] };
// null means the learner explicitly chose "I don't know"; absent means unanswered.
export type PlacementAnswers = Record<string, number | null>;
export type PlacementResult = {
  revision: string; correct: number; total: number; unknown: number;
  guidance: { title: string; description: string };
  skills: (PlacementSkill & { correct: number; total: number })[];
  recommendations: { lessonSlug: string; missed: number }[];
  review: { questionId: string; selectedIndex: number | null; correctIndex: number; explanation: string }[];
};
