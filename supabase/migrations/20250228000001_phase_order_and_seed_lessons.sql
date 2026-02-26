-- 1) 将 0→1 路径的 10 个种子节点分布到 10 个阶段：order_index 0, 100, 200, ... 900
UPDATE public.knowledge_nodes
SET order_index = (difficulty_level - 1) * 100
WHERE difficulty_level BETWEEN 1 AND 10;

-- 2) 为前 2 个知识节点各插入 2 节种子课，保证新用户进入即有内容可学
-- Python 基础：2 节
INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '变量与数据类型',
  'beginner',
  '{}',
  '[
    {"type":"concept_intro","content":"Python 中变量不需要声明类型，直接赋值即可。例如 x = 3 表示把整数 3 赋给变量 x。","analogy":"变量就像带标签的盒子，你往里面放什么，它就是什么类型。"},
    {"type":"multiple_choice","question":"下列哪个是合法的 Python 变量名？","options":["2var","var-name","var_name","var name"],"correct_index":2,"explanation":"变量名只能包含字母、数字和下划线，且不能以数字开头。var_name 符合规范。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Python 基础' ORDER BY created_at LIMIT 1),
  '["能说出 Python 变量的基本规则"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Python 基础' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '变量与数据类型' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Python 基础' LIMIT 1));

INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '列表与循环',
  'beginner',
  '{}',
  '[
    {"type":"concept_intro","content":"列表（list）是 Python 中最常用的数据结构，用方括号表示，可存放任意类型元素。例如 nums = [1, 2, 3]。用 for x in nums 可以遍历列表。","analogy":"列表就像一排按顺序排列的格子，每个格子里可以放不同的东西。"},
    {"type":"code_gap_fill","title":"补全循环","code_snippet":"for i in ____:\\n    print(i * 2)","gap_index":0,"gap_answer":"range(5)","hint":"生成 0 到 4 的整数序列"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = 'Python 基础' ORDER BY created_at LIMIT 1),
  '["能写出简单的 for 循环"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = 'Python 基础' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '列表与循环' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = 'Python 基础' LIMIT 1));

-- 线性代数基础：2 节
INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '向量',
  'beginner',
  '{}',
  '[
    {"type":"concept_intro","content":"向量是有方向和大小的量，在机器学习中常用一维数组表示。例如 [1, 0, 0] 表示三维空间中的一个点。","analogy":"向量就像从原点指向某处的箭头，箭头长度是大小，方向由坐标决定。"},
    {"type":"multiple_choice","question":"在机器学习中，一个样本的特征通常用什么表示？","options":["标量","向量","矩阵","张量"],"correct_index":1,"explanation":"单个样本的特征是一组数，用向量表示；多个样本组成矩阵。"}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = '线性代数基础' ORDER BY created_at LIMIT 1),
  '["能解释向量在 ML 中的含义"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = '线性代数基础' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '向量' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = '线性代数基础' LIMIT 1));

INSERT INTO public.generated_lessons (topic, difficulty, prerequisites, cards, source_type, status, knowledge_node_id, learning_objectives, pass_threshold)
SELECT
  '矩阵乘法',
  'beginner',
  '{}',
  '[
    {"type":"concept_intro","content":"矩阵乘法是神经网络计算的基础。A (m×n) 乘 B (n×p) 得到 C (m×p)，C 的每个元素是 A 的对应行与 B 的对应列的点积。","analogy":"就像行与列配对跳舞，每一对相乘再相加得到结果矩阵的一个格子。"},
    {"type":"match_pairs","title":"概念配对","pairs":[{"key":"标量","value":"单个实数"},{"key":"向量","value":"一行或一列的数"},{"key":"矩阵","value":"二维数组"}]}
  ]'::jsonb,
  'cron',
  'published',
  (SELECT id FROM public.knowledge_nodes WHERE title = '线性代数基础' ORDER BY created_at LIMIT 1),
  '["能说出矩阵乘法的维度规则"]'::jsonb,
  0.8
WHERE EXISTS (SELECT 1 FROM public.knowledge_nodes WHERE title = '线性代数基础' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.generated_lessons WHERE topic = '矩阵乘法' AND knowledge_node_id = (SELECT id FROM public.knowledge_nodes WHERE title = '线性代数基础' LIMIT 1));
