export const ACHIEVEMENT_DEFS = [
  { id: "first_lesson", name: "初来乍到", description: "完成第 1 课时", icon: "🎯" },
  { id: "ten_lessons", name: "小有收获", description: "完成 10 课时", icon: "📚" },
  { id: "streak_7", name: "坚持一周", description: "连续学习 7 天", icon: "🔥" },
  { id: "streak_30", name: "月度达人", description: "连续学习 30 天", icon: "⭐" },
  { id: "perfect_quiz", name: "满分通过", description: "单次练习全部答对", icon: "💯" },
  { id: "ai_course", name: "AI 探索", description: "学习一节 AI 生成课程", icon: "🤖" },
] as const;

export function getAchievementById(id: string) {
  return ACHIEVEMENT_DEFS.find((a) => a.id === id);
}
