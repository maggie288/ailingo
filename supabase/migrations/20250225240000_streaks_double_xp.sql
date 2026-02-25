-- Buff: next lesson gives double XP (consumed on completion)
ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS double_xp_until TIMESTAMPTZ;
