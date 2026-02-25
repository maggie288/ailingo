/**
 * 学习路径 0-1：难度与主题到路径节点的映射逻辑
 * - 难度 1-3：基础（beginner）
 * - 难度 4-6：核心（intermediate）
 * - 难度 7-10：进阶（advanced）
 */

export type DifficultyLabel = "beginner" | "intermediate" | "advanced";

/** 难度文案 → 1-10 的区间 [min, max] */
const DIFFICULTY_BAND: Record<DifficultyLabel, [number, number]> = {
  beginner: [1, 3],
  intermediate: [4, 6],
  advanced: [7, 10],
};

/** 区间中点，用于排序和“默认落点” */
const BAND_MID: Record<DifficultyLabel, number> = {
  beginner: 2,
  intermediate: 5,
  advanced: 8,
};

/**
 * 将知识节点的 difficulty_level (1-10) 转为 API 用的 DifficultyLabel
 */
export function difficultyLevelToLabel(level: number): DifficultyLabel {
  if (level >= 7) return "advanced";
  if (level >= 4) return "intermediate";
  return "beginner";
}

/**
 * 将课程难度标签映射到 1-10 的区间
 */
export function getDifficultyBand(
  difficulty: DifficultyLabel | string
): [number, number] {
  const key = difficulty as DifficultyLabel;
  return DIFFICULTY_BAND[key] ?? [1, 3];
}

/**
 * 得到难度区间的代表值（用于在同一区间内排序）
 */
export function getDifficultyLevelForSort(
  difficulty: DifficultyLabel | string
): number {
  const key = difficulty as DifficultyLabel;
  return BAND_MID[key] ?? 2;
}

/**
 * 主题关键词 → 路径节点标题（与 seed 中的 title 一致）
 * 用于将 AI 生成课挂到最相关的节点下
 */
const TOPIC_TO_NODE_TITLE: Array<{ pattern: RegExp | string; title: string }> = [
  { pattern: /python|编程|基础|入门/i, title: "Python 基础" },
  { pattern: /线性代数|矩阵|向量/i, title: "线性代数基础" },
  { pattern: /神经网络|neural|反向传播|感知机/i, title: "神经网络入门" },
  { pattern: /attention|注意力|self-attention|缩放点积/i, title: "Attention 机制" },
  { pattern: /transformer|编码器|解码器|位置编码/i, title: "Transformer" },
  { pattern: /gpt|预训练|自回归|language model/i, title: "GPT 系列" },
  { pattern: /llama|开源模型|高效架构/i, title: "LLaMA 与开源模型" },
  { pattern: /moe|混合专家|稀疏|mixture of expert/i, title: "MoE 与混合专家" },
  { pattern: /agent|推理|工具调用|reasoning/i, title: "Agent 与推理" },
  { pattern: /rag|检索增强|retrieval|知识库/i, title: "RAG 与检索增强" },
];

export type KnowledgeNodeRow = {
  id: string;
  title: string;
  difficulty_level: number;
  order_index: number;
};

/**
 * 根据主题文本推荐应挂载的节点 title；若无匹配则返回 null（由 suggestKnowledgeNodeId 按难度区间兜底）
 */
export function suggestNodeTitle(topic: string): string | null {
  const lower = topic.toLowerCase().trim();
  for (const { pattern, title } of TOPIC_TO_NODE_TITLE) {
    if (typeof pattern === "string") {
      if (lower.includes(pattern.toLowerCase())) return title;
    } else {
      if (pattern.test(topic) || pattern.test(lower)) return title;
    }
  }
  return null;
}

/**
 * 在已获取的节点列表中，为「主题 + 难度」选出最合适的 knowledge_node_id
 */
export function suggestKnowledgeNodeId(
  topic: string,
  difficulty: DifficultyLabel | string,
  nodes: KnowledgeNodeRow[]
): string | null {
  const suggestedTitle = suggestNodeTitle(topic);
  if (suggestedTitle) {
    const node = nodes.find((n) => n.title === suggestedTitle);
    if (node) return node.id;
  }
  const [minLevel, maxLevel] = getDifficultyBand(difficulty);
  const inBand = nodes.filter(
    (n) => n.difficulty_level >= minLevel && n.difficulty_level <= maxLevel
  );
  if (inBand.length > 0) {
    inBand.sort((a, b) => a.difficulty_level - b.difficulty_level || a.order_index - b.order_index);
    return inBand[0].id;
  }
  return null;
}
