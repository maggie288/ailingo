/**
 * 0→1 路径的 10 个阶段名称，与 curriculum_ai_1000 种子一致。
 * order_index 0-99 = phase 1, 100-199 = phase 2, ...
 */
export const PHASE_NAMES: Record<number, string> = {
  1: "编程与数学基础",
  2: "机器学习入门",
  3: "深度学习基础",
  4: "序列与文本",
  5: "Attention与Transformer",
  6: "预训练与微调",
  7: "大模型架构",
  8: "推理与部署",
  9: "Agent与工具",
  10: "前沿与综合",
};

export const PHASE_ORDER_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function getPhaseOrderFromOrderIndex(orderIndex: number): number {
  return Math.floor(orderIndex / 100) + 1;
}

export function getPhaseName(phaseOrder: number): string {
  return PHASE_NAMES[phaseOrder] ?? `阶段 ${phaseOrder}`;
}
