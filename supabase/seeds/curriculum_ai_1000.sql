-- ============================================================
-- AI 大模型 0→1 课程：1000 个知识节点（每节点对应 1 节 AI 生成微课）
-- 使用方式：在 Supabase Dashboard → SQL Editor 中执行本文件即可。
-- 本脚本只做 INSERT，不删除任何已有数据（持续增加、不删历史）。
-- 仅在需要「全新清空再建」时，才在 SQL Editor 里先执行文档中的 DELETE 语句，再执行本 INSERT。
-- ============================================================

INSERT INTO public.knowledge_nodes (title, description, difficulty_level, order_index, category)
SELECT
  '【' || p.phase_name || '】第 ' || gs.n || ' 节',
  'AI大模型 0→1 系统课程，本节点由 AI 生成具体微课内容。',
  p.phase_num,
  (p.phase_num - 1) * 100 + gs.n - 1,
  'theory'
FROM (
  VALUES
    (1, '编程与数学基础'),
    (2, '机器学习入门'),
    (3, '深度学习基础'),
    (4, '序列与文本'),
    (5, 'Attention与Transformer'),
    (6, '预训练与微调'),
    (7, '大模型架构'),
    (8, '推理与部署'),
    (9, 'Agent与工具'),
    (10, '前沿与综合')
) AS p(phase_num, phase_name),
generate_series(1, 100) AS gs(n)
ORDER BY p.phase_num, gs.n;
