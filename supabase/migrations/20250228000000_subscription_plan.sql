-- 盈利模式：免费 vs Pro 订阅
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS subscription_end_at TIMESTAMPTZ;
COMMENT ON COLUMN public.profiles.subscription_plan IS 'free | pro';
COMMENT ON COLUMN public.profiles.subscription_end_at IS 'Pro 订阅到期时间，NULL 表示未订阅或已过期';
