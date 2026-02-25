-- 完整 knowledge_graph 结构：concept_name、prerequisites、resources
-- prerequisites: 前置知识点，UUID[] 存节点 id
-- resources: 资源列表，JSONB [{ "type": "paper"|"code"|"video"|"article", "title": "", "url": "" }]

ALTER TABLE public.knowledge_nodes
  ADD COLUMN IF NOT EXISTS concept_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';

-- Backfill concept_name from title
UPDATE public.knowledge_nodes
SET concept_name = COALESCE(concept_name, title)
WHERE concept_name IS NULL;

COMMENT ON COLUMN public.knowledge_nodes.prerequisites IS 'Array of knowledge_node ids (UUID strings) that are prerequisites';
COMMENT ON COLUMN public.knowledge_nodes.resources IS 'Array of { type, title, url } objects';
