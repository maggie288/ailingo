/**
 * 统一 AI 模型选择：优先 MiniMax（MINIMAX_API_KEY），否则 OpenAI（OPENAI_API_KEY）。
 * 课程生成等重任务用主模型，概念提取/题目生成为轻量模型。
 * 国内版 minimaxi.com：设 MINIMAX_BASE_URL，可选 MINIMAX_GROUP_ID；若仍 invalid api key 可试 MINIMAX_USE_OPENAI=1 走 OpenAI 兼容地址。
 */

import { openai } from "@ai-sdk/openai";
import { createMinimax, createMinimaxOpenAI } from "vercel-minimax-ai-provider";
import type { LanguageModelV3 } from "@ai-sdk/provider";

const MINIMAX_MAIN = "MiniMax-M2.5" as const;
/** 官方文档为 MiniMax-M2.1-highspeed；勿用 MiniMax-M2.1-lightning（coding plan 不支持） */
const MINIMAX_LIGHT = "MiniMax-M2.1-highspeed" as const;

function getMinimaxModel(modelId: string): LanguageModelV3 {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error("MINIMAX_API_KEY is not set");
  const baseURL = process.env.MINIMAX_BASE_URL?.trim() || undefined;
  const groupId = process.env.MINIMAX_GROUP_ID?.trim() || undefined;
  const useOpenAICompat = process.env.MINIMAX_USE_OPENAI === "1" || process.env.MINIMAX_USE_OPENAI === "true";

  if (useOpenAICompat && baseURL) {
    // 国内版部分环境只开放 OpenAI 兼容接口
    const openaiProvider = createMinimaxOpenAI({
      apiKey,
      baseURL,
      headers: groupId ? { "Group-Id": groupId } : undefined,
    });
    return openaiProvider(modelId);
  }

  const headers: Record<string, string> = {};
  if (groupId) headers["Group-Id"] = groupId;
  const minimax = createMinimax({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
    ...(Object.keys(headers).length ? { headers } : {}),
  });
  return minimax(modelId);
}

/** 当前是否优先使用 MiniMax（有 MINIMAX_API_KEY） */
export function isMiniMaxPreferred(): boolean {
  return !!process.env.MINIMAX_API_KEY?.trim();
}

/** 用于课程生成等重任务（结构化 JSON 输出） */
export function getModelForLesson(): LanguageModelV3 {
  if (isMiniMaxPreferred()) return getMinimaxModel(MINIMAX_MAIN);
  if (process.env.OPENAI_API_KEY?.trim()) return openai("gpt-4o");
  throw new Error("Set MINIMAX_API_KEY or OPENAI_API_KEY for AI course generation.");
}

/** 用于论文/URL 异步生成：更快模型，便于在 Vercel 60s 内完成，仍输出完整课时 */
export function getModelForLessonAsync(): LanguageModelV3 {
  if (isMiniMaxPreferred()) return getMinimaxModel(MINIMAX_LIGHT);
  if (process.env.OPENAI_API_KEY?.trim()) return openai("gpt-4o-mini");
  throw new Error("Set MINIMAX_API_KEY or OPENAI_API_KEY for AI course generation.");
}

/** 用于概念提取、题目生成等轻量任务 */
export function getModelForExtract(): LanguageModelV3 {
  if (isMiniMaxPreferred()) return getMinimaxModel(MINIMAX_LIGHT);
  if (process.env.OPENAI_API_KEY?.trim()) return openai("gpt-4o-mini");
  throw new Error("Set MINIMAX_API_KEY or OPENAI_API_KEY for AI features.");
}

/** 任意一方配置了即可用 AI 生成 */
export function hasAnyAiKey(): boolean {
  return !!(process.env.MINIMAX_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
}
