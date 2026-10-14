-- Isolated free KNM practice; these rows are not paid exam results or certificates.
CREATE TABLE knm_completed_lessons (
  user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_slug)
);
CREATE TABLE knm_question_progress (
  user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  needs_review BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);
