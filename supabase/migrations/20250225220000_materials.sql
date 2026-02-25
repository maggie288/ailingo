-- Materials: uploaded sources (PDF/image/MD) for course generation
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
