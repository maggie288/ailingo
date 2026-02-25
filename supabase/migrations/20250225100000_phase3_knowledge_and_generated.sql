-- Phase 3: Knowledge graph + AI-generated lessons (card-based)

-- Knowledge nodes: learning path nodes with hierarchy and difficulty
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

-- AI-generated lessons: one lesson = one topic with cards array (strict JSON for frontend)
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
CREATE POLICY "Anyone can read published generated_lessons" ON public.generated_lessons
  FOR SELECT USING (status = 'published' OR status = 'draft');
CREATE POLICY "Service role can insert/update generated_lessons" ON public.generated_lessons
  FOR ALL USING (true);

-- User progress for generated lessons (by generated_lessons.id)
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
CREATE POLICY "Users can read own generated_lesson_progress" ON public.generated_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert/update own generated_lesson_progress" ON public.generated_lesson_progress
  FOR ALL USING (auth.uid() = user_id);
