-- 异步生成任务表：论文/URL 提交后先落库，再轮询结果，避免长连接超时
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('arxiv', 'url')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own generation_jobs" ON public.generation_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation_jobs" ON public.generation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 仅服务端用 service role 更新 status/result/error（process 接口）
CREATE POLICY "Users can update own generation_jobs" ON public.generation_jobs
  FOR UPDATE USING (auth.uid() = user_id);
