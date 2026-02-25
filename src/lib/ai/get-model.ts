/**
 * 统一 AI 模型选择：优先 MiniMax（MINIMAX_API_KEY），否则 OpenAI（OPENAI_API_KEY）。
 * 课程生成等重任务用主模型，概念提取/题目生成为轻量模型。
 */

import { openai } from "@ai-sdk/openai";
import { createMinimax } from "vercel-minimax-ai-provider";
import type { LanguageModelV3 } from "@ai-sdk/provider";

const MINIMAX_MAIN = "MiniMax-M2.5" as const;
const MINIMAX_LIGHT = "MiniMax-M2.1-lightning" as const;

function getMinimaxModel(modelId: string): LanguageModelV3 {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error("MINIMAX_API_KEY is not set");
  const minimax = createMinimax({ apiKey });
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
