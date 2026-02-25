-- Add order_index for sibling order within same difficulty_level
ALTER TABLE public.knowledge_nodes
  ADD COLUMN IF NOT EXISTS order_index INT NOT NULL DEFAULT 0;

-- Seed 0-1 learning path: 难度1-3 基础 → 4-6 核心 → 7-10 进阶
-- Only insert if no nodes exist (idempotent seed)
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
