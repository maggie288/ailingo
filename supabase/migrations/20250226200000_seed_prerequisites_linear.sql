-- ============================================================
-- 为已有知识节点按 order_index 设置「线性前置」：每节依赖上一节
-- 执行后：order_index=0 无前置，order_index=1 依赖 0，以此类推，路径锁定生效
-- 使用方式：在 Supabase SQL Editor 中执行本文件（或只执行下面 UPDATE）
-- ============================================================

UPDATE public.knowledge_nodes n1
SET prerequisites = (
  SELECT COALESCE(jsonb_agg(n2.id::text), '[]'::jsonb)
  FROM public.knowledge_nodes n2
  WHERE n2.order_index = n1.order_index - 1
),
updated_at = now()
WHERE n1.order_index > 0;
