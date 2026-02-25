-- Allow source_type 'topic' for course generated from topic only
ALTER TABLE public.generated_lessons
  DROP CONSTRAINT IF EXISTS generated_lessons_source_type_check;

ALTER TABLE public.generated_lessons
  ADD CONSTRAINT generated_lessons_source_type_check
  CHECK (source_type IN ('arxiv', 'github', 'url', 'cron', 'topic'));
