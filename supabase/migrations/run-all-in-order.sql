-- ============================================================
-- AILingo: 在 Supabase SQL Editor 中一次性按顺序执行全部迁移
-- 使用方式：复制本文件全部内容 → Supabase Dashboard → SQL Editor → 粘贴 → Run
-- ============================================================

-- ---------- 1. 20250225000001_initial_schema.sql ----------
-- AILingo Phase 2: Core learning schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'zh',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours NUMERIC(4,1) DEFAULT 0,
  color TEXT DEFAULT '#58CC02',
  is_ai_generated BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published courses" ON public.courses FOR SELECT USING (status = 'published');

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#58CC02',
  unlock_condition JSONB
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read units" ON public.units FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  knowledge_node_id UUID,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'theory' CHECK (type IN ('theory', 'quiz', 'mixed')),
  content TEXT DEFAULT '',
  order_index INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read lessons" ON public.lessons FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON public.lessons(unit_id);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'multiple_select', 'boolean', 'fill_blank', 'code_completion', 'drag_sort')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT DEFAULT '',
  points INT DEFAULT 10,
  difficulty INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON public.questions(lesson_id);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score NUMERIC(5,2) DEFAULT 0,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson ON public.user_progress(user_id, lesson_id);

CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  INSERT INTO public.streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- 2. 20250225100000_phase3_knowledge_and_generated.sql ----------
CREATE TABLE IF NOT EXISTS public.knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE SET NULL,
  difficulty_level INT CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  category VARCHAR(50) CHECK (category IN ('theory', 'pataset', 'paper', 'code')),
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_parent ON public.knowledge_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_difficulty ON public.knowledge_nodes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_category ON public.knowledge_nodes(category);
ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read knowledge_nodes" ON public.knowledge_nodes FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.generated_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(255) NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  prerequisites TEXT[] DEFAULT '{}',
  cards JSONB NOT NULL DEFAULT '[]',
  source_type VARCHAR(50) CHECK (source_type IN ('arxiv', 'github', 'url', 'cron')),
  source_id TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  knowledge_node_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_generated_lessons_status ON public.generated_lessons(status);
CREATE INDEX IF NOT EXISTS idx_generated_lessons_difficulty ON public.generated_lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_generated_lessons_created ON public.generated_lessons(created_at DESC);
ALTER TABLE public.generated_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published generated_lessons" ON public.generated_lessons FOR SELECT USING (status = 'published' OR status = 'draft');
CREATE POLICY "Service role can insert/update generated_lessons" ON public.generated_lessons FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS public.generated_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.generated_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_generated_progress_user ON public.generated_lesson_progress(user_id);
ALTER TABLE public.generated_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own generated_lesson_progress" ON public.generated_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own generated_lesson_progress" ON public.generated_lesson_progress FOR ALL USING (auth.uid() = user_id);

-- ---------- 3. 20250225110000_seed_learning_path.sql ----------
ALTER TABLE public.knowledge_nodes ADD COLUMN IF NOT EXISTS order_index INT NOT NULL DEFAULT 0;
INSERT INTO public.knowledge_nodes (title, description, difficulty_level, order_index, category)
SELECT v.title, v.description, v.difficulty_level, v.order_index, v.category
FROM (VALUES
  ('Python 基础', '编程入门与数据处理', 1, 0, 'code'),
  ('线性代数基础', '向量、矩阵与基本运算', 2, 0, 'theory'),
  ('神经网络入门', '感知机、反向传播与基础网络', 3, 0, 'theory'),
  ('Attention 机制', 'Self-Attention 与缩放点积注意力', 4, 0, 'theory'),
  ('Transformer', '编码器-解码器与位置编码', 5, 0, 'theory'),
  ('GPT 系列', '自回归语言模型与预训练', 6, 0, 'paper'),
  ('LLaMA 与开源模型', '高效架构与开源生态', 7, 0, 'paper'),
  ('MoE 与混合专家', '稀疏激活与规模化', 8, 0, 'theory'),
  ('Agent 与推理', '工具调用与多步推理', 9, 0, 'theory'),
  ('RAG 与检索增强', '检索、增强生成与知识库', 10, 0, 'theory')
) AS v(title, description, difficulty_level, order_index, category)
WHERE NOT EXISTS (SELECT 1 FROM public.knowledge_nodes LIMIT 1);

-- ---------- 4. 20250225200000_daily_tasks.sql (省略重复的 streak 策略) ----------
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
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------- 5. 20250225210000_hearts_coins.sql ----------
ALTER TABLE public.streaks
  ADD COLUMN IF NOT EXISTS hearts INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS hearts_max INT NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS last_hearts_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS coins INT NOT NULL DEFAULT 0;

-- ---------- 6. 20250225220000_materials.sql ----------
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'extracted', 'failed')),
  extracted_content TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_materials_user ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_status ON public.materials(status);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own materials" ON public.materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.materials FOR UPDATE USING (auth.uid() = user_id);

-- ---------- 7. 20250225230000_generated_lessons_source_topic.sql ----------
ALTER TABLE public.generated_lessons DROP CONSTRAINT IF EXISTS generated_lessons_source_type_check;
ALTER TABLE public.generated_lessons
  ADD CONSTRAINT generated_lessons_source_type_check
  CHECK (source_type IN ('arxiv', 'github', 'url', 'cron', 'topic'));

-- ---------- 8. 20250225240000_streaks_double_xp.sql ----------
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS double_xp_until TIMESTAMPTZ;

-- ---------- 9. 20250225250000_knowledge_graph_full.sql ----------
ALTER TABLE public.knowledge_nodes
  ADD COLUMN IF NOT EXISTS concept_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
UPDATE public.knowledge_nodes SET concept_name = COALESCE(concept_name, title) WHERE concept_name IS NULL;
COMMENT ON COLUMN public.knowledge_nodes.prerequisites IS 'Array of knowledge_node ids (UUID strings) that are prerequisites';
COMMENT ON COLUMN public.knowledge_nodes.resources IS 'Array of { type, title, url } objects';
