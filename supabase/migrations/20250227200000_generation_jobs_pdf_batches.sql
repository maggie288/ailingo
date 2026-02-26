-- PDF/URL 分批生成：扩展 generation_jobs 支持多节
ALTER TABLE public.generation_jobs
  ADD COLUMN IF NOT EXISTS batches_total INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS batches_done INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cached_chunks JSONB;

COMMENT ON COLUMN public.generation_jobs.batches_total IS 'PDF/URL 分批时总批数';
COMMENT ON COLUMN public.generation_jobs.batches_done IS '已完成批数';
COMMENT ON COLUMN public.generation_jobs.cached_chunks IS 'PDF 解析后的文本块数组，每批生成一节';
