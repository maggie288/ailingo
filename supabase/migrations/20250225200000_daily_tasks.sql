-- Daily tasks for learn/quiz/review goals
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('learn', 'quiz', 'review')),
  target_count INT NOT NULL DEFAULT 1,
  completed_count INT NOT NULL DEFAULT 0,
  reward_points INT DEFAULT 0,
  UNIQUE(user_id, date, task_type)
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, date);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own daily_tasks" ON public.daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_tasks" ON public.daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_tasks" ON public.daily_tasks FOR UPDATE USING (auth.uid() = user_id);

-- Ensure streaks has INSERT for new users (trigger already creates row on signup)
CREATE POLICY "Users can insert own streak" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- Allow inserting user_achievements when unlocking
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
