import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionLimits = {
  isPro: boolean;
  dailyGenerationsUsed: number;
  dailyLimit: number;
  canGenerate: boolean;
};

const FREE_DAILY_GENERATION_LIMIT = 1;

/**
 * 获取当前用户的订阅与今日生成次数（用于免费用户限制）。
 * 按 generation_jobs 今日创建数统计（仅统计论文/URL 任务；主题与上传可后续纳入）。
 */
export async function getSubscriptionLimits(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionLimits> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();

  const [profileRes, jobsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_plan, subscription_end_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("generation_jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStartIso),
  ]);

  const plan = (profileRes.data as { subscription_plan?: string } | null)?.subscription_plan ?? "free";
  const endAt = (profileRes.data as { subscription_end_at?: string } | null)?.subscription_end_at;
  const isPro = plan === "pro" && (!endAt || new Date(endAt) > new Date());
  const dailyGenerationsUsed = jobsRes.count ?? 0;
  const dailyLimit = isPro ? 999 : FREE_DAILY_GENERATION_LIMIT;
  const canGenerate = isPro || dailyGenerationsUsed < dailyLimit;

  return {
    isPro,
    dailyGenerationsUsed,
    dailyLimit,
    canGenerate,
  };
}
