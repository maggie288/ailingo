-- 为阶段 3、4、5 各增加 2 节种子课，提升路径内容竞争力（全部免费后内容为王）
-- 神经网络入门（阶段3）、Attention 机制（阶段4）、Transformer（阶段5）

-- 神经网络入门：2 节
INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '感知机',
  'beginner',
  '{}',
  '[
    {"type":"concept_intro","content":"感知机是最简单的神经网络单元：接收多个输入，乘以权重后求和，再通过激活函数输出 0 或 1。可用来做二分类。","analogy":"就像投票：每个输入是一票，权重是票的权重，超过阈值就输出「通过」。"},
    {"type":"multiple_choice","question":"感知机的输出通常是什么？","options":["连续实数","0 或 1","任意整数","向量"],"correct_index":1,"explanation":"经典感知机使用阶跃函数，输出二值 0 或 1，用于二分类。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = '神经网络入门' ORDER BY created_at LIMIT 1),
  '["能说出感知机的输入输出与作用"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = '神经网络入门' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '感知机' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = '神经网络入门' LIMIT 1));

INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '反向传播',
  'intermediate',
  '{}',
  '[
    {"type":"concept_intro","content":"反向传播用链式法则从输出层向输入层传播误差，逐层更新权重。这样多层网络才能通过梯度下降学习。","analogy":"从结果倒推责任：最后一层先算自己错了多少，再把误差往前一层层分摊。"},
    {"type":"multiple_choice","question":"反向传播的主要作用是什么？","options":["前向计算输出","计算每层权重的梯度","初始化参数","做数据增强"],"correct_index":1,"explanation":"反向传播用来计算损失对每层权重的梯度，以便用梯度下降更新权重。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = '神经网络入门' ORDER BY created_at LIMIT 1),
  '["能解释反向传播在训练中的作用"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = '神经网络入门' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '反向传播' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = '神经网络入门' LIMIT 1));

-- Attention 机制：2 节
INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  'Self-Attention 概念',
  'intermediate',
  '{}',
  '[
    {"type":"concept_intro","content":"Self-Attention 让序列中每个位置都能「看到」其他位置并加权聚合。Query、Key、Value 分别用来查、被查、提供内容，相似度高的 Key 对应更大权重。","analogy":"像开会：每个人（Query）问「谁和我的问题相关？」根据相关性（Key 相似度）把别人的发言（Value）加权听进去。"},
    {"type":"match_pairs","title":"概念配对","pairs":[{"key":"Query","value":"当前位置要查什么"},{"key":"Key","value":"各位置提供的检索键"},{"key":"Value","value":"各位置提供的内容"}]}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Attention 机制' ORDER BY created_at LIMIT 1),
  '["能说出 Q/K/V 在 Attention 中的角色"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Attention 机制' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = 'Self-Attention 概念' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Attention 机制' LIMIT 1));

INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '缩放点积注意力',
  'intermediate',
  '{}',
  '[
    {"type":"concept_intro","content":"缩放点积注意力用 Q·K^T / sqrt(d_k) 得到注意力分数，再 softmax 后与 V 相乘。除以 sqrt(d_k) 是为了避免点积过大导致 softmax 梯度变小。","analogy":"先把「匹配度」归一化到合理范围，再按这个权重混合 Value。"},
    {"type":"multiple_choice","question":"为什么要点积结果除以 sqrt(d_k)？","options":["加快计算","避免数值过大导致 softmax 梯度消失","减少参数量","没有特别原因"],"correct_index":1,"explanation":"d_k 较大时点积方差大，softmax 会趋近 one-hot，梯度很小；缩放后更稳定。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Attention 机制' ORDER BY created_at LIMIT 1),
  '["能解释缩放因子的作用"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Attention 机制' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '缩放点积注意力' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Attention 机制' LIMIT 1));

-- Transformer：2 节
INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '编码器与解码器',
  'intermediate',
  '{}',
  '[
    {"type":"concept_intro","content":"Transformer 由编码器和解码器堆叠而成。编码器只看输入序列，用 Self-Attention 和 FFN；解码器在生成时既看已生成部分，又通过 Cross-Attention 看编码器输出。","analogy":"编码器把整段输入「消化」成一组表示；解码器一边看自己的输出，一边查编码器的结果，逐个生成。"},
    {"type":"multiple_choice","question":"解码器中的 Cross-Attention 的 Key/Value 来自哪里？","options":["解码器自身","编码器输出","输入词嵌入","无需 K/V"],"correct_index":1,"explanation":"Cross-Attention 让解码器查询编码器输出，所以 K 和 V 来自编码器。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Transformer' ORDER BY created_at LIMIT 1),
  '["能区分编码器与解码器的职责"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Transformer' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '编码器与解码器' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Transformer' LIMIT 1));

INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '位置编码',
  'intermediate',
  '{}',
  '[
    {"type":"concept_intro","content":"Self-Attention 本身不区分位置，所以需要位置编码（PE）把顺序信息加进输入。常用正弦/余弦函数生成不同频率的 PE，或可学习的位置嵌入。","analogy":"给每个座位贴一个「第几排第几列」的标签，模型才能知道顺序。"},
    {"type":"code_gap_fill","title":"常见用法","code_snippet":"# 在 Transformer 中，输入 = 词嵌入 ____ 位置编码","gap_index":0,"gap_answer":"+","hint":"两者相加"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Transformer' ORDER BY created_at LIMIT 1),
  '["能说出位置编码的作用"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Transformer' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '位置编码' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Transformer' LIMIT 1));
