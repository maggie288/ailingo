-- 支持「上传资料」生成的课时来源类型，便于持续增加、不删历史
ALTER TABLE public.generated_lessons DROP CONSTRAINT IF EXISTS generated_lessons_source_type_check;
ALTER TABLE public.generated_lessons
  ADD CONSTRAINT generated_lessons_source_type_check
  CHECK (source_type IN ('arxiv', 'github', 'url', 'cron', 'topic', 'material'));
