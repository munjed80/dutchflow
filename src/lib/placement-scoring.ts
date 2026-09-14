import type { PlacementAnswers, PlacementBank, PlacementResult, PublicPlacement } from "./placement-types";

export function publicPlacement(bank: PlacementBank): PublicPlacement {
  return {
    revision: bank.revision,
    skills: bank.skills.map(({ id, title }) => ({ id, title })),
    // Explicit allowlist: adding a key to authored content must not expose it before grading.
    questions: bank.questions.map(({ id, skill, prompt, passage, options, optionLanguage }) => ({
      id, skill, prompt, ...(passage ? { passage } : {}), options: [...options], optionLanguage,
    })),
  };
}

export function validAnswers(value: unknown, bank: Pick<PublicPlacement, "questions">, partial = false): value is PlacementAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  const keys = Object.keys(answers);
  if ((!partial && keys.length !== bank.questions.length) || keys.length > bank.questions.length) return false;
  return keys.every((key) => {
    const question = bank.questions.find((question) => question.id === key);
    const answer = answers[key];
    return question && (answer === null || (typeof answer === "number" && Number.isInteger(answer) && answer >= 0 && answer < question.options.length));
  });
}

export function gradePlacement(bank: PlacementBank, answers: PlacementAnswers): PlacementResult {
  if (!validAnswers(answers, bank)) throw new Error("Incomplete or invalid answers");
  const correct = bank.questions.filter((question) => answers[question.id] === question.correctIndex).length;
  const ratio = correct / bank.questions.length;
  const missed = new Map<string, number>();
  for (const question of bank.questions) {
    if (answers[question.id] !== question.correctIndex) missed.set(question.lessonSlug, (missed.get(question.lessonSlug) || 0) + 1);
  }
  return {
    revision: bank.revision, correct, total: bank.questions.length,
    unknown: Object.values(answers).filter((answer) => answer === null).length,
    guidance: ratio < 0.5 ? {
      title: "ابدأ بأساسيات المسار",
      description: "ابدأ بدروس التعارف والمعلومات الشخصية والأرقام، ثم تابع بالترتيب. يمكنك العودة إلى هذا الاختبار بعد بعض الممارسة.",
    } : ratio < 0.8 ? {
      title: "راجع ما يحتاج إلى تثبيت",
      description: "لديك إجابات صحيحة في عدد من المواقف. راجع الأخطاء والدروس المقترحة أدناه، ثم واصل مسار A1.",
    } : {
      title: "وسّع ممارستك في مواقف الحياة",
      description: "أجبت بشكل صحيح عن معظم هذه العيّنة. واصل دروس A1 وركّز على الاستماع والمحادثة والكتابة؛ هذه المهارات لم يقسها الاختبار.",
    },
    skills: bank.skills.map((skill) => {
      const questions = bank.questions.filter((question) => question.skill === skill.id);
      return { ...skill, correct: questions.filter((question) => answers[question.id] === question.correctIndex).length, total: questions.length };
    }),
    recommendations: [...missed].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([lessonSlug, count]) => ({ lessonSlug, missed: count })),
    review: bank.questions.map((question) => ({
      questionId: question.id, selectedIndex: answers[question.id], correctIndex: question.correctIndex, explanation: question.explanation,
    })),
  };
}
