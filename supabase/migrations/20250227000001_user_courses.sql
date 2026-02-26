-- ============================================================
-- 用户生成课程：上传资料 / 论文·URL 生成的课程单独成「我的生成课程」，与系统 0→1 路径并列
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('material', 'url', 'arxiv', 'topic')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_courses_user ON public.user_courses(user_id);
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_courses" ON public.user_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_courses" ON public.user_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_courses" ON public.user_courses FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.generated_lessons
  ADD COLUMN IF NOT EXISTS user_course_id UUID REFERENCES public.user_courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_generated_lessons_user_course ON public.generated_lessons(user_course_id);

COMMENT ON TABLE public.user_courses IS '用户上传/论文/URL 生成的课程，与系统 0→1 路径并列';
COMMENT ON COLUMN public.generated_lessons.user_course_id IS '属于用户生成课程时非空；系统路径课时此项为空';
