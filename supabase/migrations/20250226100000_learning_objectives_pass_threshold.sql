-- P0 课程设计：每节学习目标 + 通过标准
-- 使用方式：在 Supabase SQL Editor 中执行，或 npx supabase db push
ALTER TABLE public.generated_lessons
  ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS pass_threshold NUMERIC(3,2) DEFAULT 0.8;
COMMENT ON COLUMN public.generated_lessons.learning_objectives IS '1-3条本节学习目标，可被练习检验';
COMMENT ON COLUMN public.generated_lessons.pass_threshold IS '通过标准，0-1，默认0.8即80%正确率';
