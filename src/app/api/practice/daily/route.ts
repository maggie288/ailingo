import { NextResponse } from "next/server";
import { MOCK_QUESTIONS } from "@/lib/data/mock";
import type { Question } from "@/types/database";

function getShuffledDailyQuestions(count: number): Question[] {
  const all: Question[] = [];
  for (const qList of Object.values(MOCK_QUESTIONS)) {
    all.push(...qList);
  }
  if (all.length === 0) return [];
  const daySeed = Math.floor(Date.now() / 86400000);
  const rng = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  const indices: number[] = [];
  for (let i = 0; i < Math.min(count, all.length); i++) {
    const j = i + Math.floor(rng(daySeed + i) * (all.length - i));
    indices.push(j);
  }
  const shuffled = [...all].sort(() => rng(daySeed + 1) - 0.5);
  return shuffled.slice(0, count);
}

export async function GET() {
  const questions = getShuffledDailyQuestions(7);
  return NextResponse.json(questions);
}
