import a2Links from "@/data/a2-review-links.json";
import linksData from "@/data/a1-review-links.json";
import { getLesson } from "@/lib/content";

export type ReviewLesson = { slug: string; title: string };
export type QuestionReviewLessons = Record<string, ReviewLesson[]>;
const links: Record<string, string[]> = { ...linksData, ...a2Links };

/** Project only the current exercise's lesson links into client props. */
export function getQuestionReviewLessons(questions: { id: string }[]): QuestionReviewLessons {
  return Object.fromEntries(questions.map(({ id }) => [id, (links[id] ?? []).map((slug) => {
    const lesson = getLesson(slug);
    if (!lesson) throw new Error(`Unknown review lesson: ${slug}`);
    return { slug: lesson.slug, title: lesson.title };
  })]));
}
