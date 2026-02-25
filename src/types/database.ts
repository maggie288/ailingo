/**
 * AILingo - Database type definitions for Supabase (PostgreSQL)
 */

export type Resource = {
  type: 'paper' | 'code' | 'video' | 'article';
  title: string;
  url: string;
  description?: string;
};

export type KnowledgeNode = {
  id: string;
  concept_name: string;
  description: string;
  parent_id: string | null;
  complexity_level: number;
  category: 'theory' | 'paper' | 'code' | 'tool';
  prerequisites: string[];
  resources: Resource[];
  created_at: string;
  updated_at?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  icon_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  color: string;
  is_ai_generated: boolean;
  status: 'draft' | 'published';
  created_by: string;
  created_at?: string;
};

export type Unit = {
  id: string;
  course_id: string;
  order_index: number;
  title: string;
  description: string | null;
  color: string;
  unlock_condition: Record<string, unknown> | null;
};

export type Lesson = {
  id: string;
  unit_id: string;
  knowledge_node_id: string | null;
  title: string;
  type: 'theory' | 'quiz' | 'mixed';
  content: string;
  order_index: number;
  duration_minutes: number;
  created_at?: string;
};

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type Question = {
  id: string;
  lesson_id: string;
  type:
    | 'multiple_choice'
    | 'multiple_select'
    | 'boolean'
    | 'fill_blank'
    | 'code_completion'
    | 'drag_sort';
  question_text: string;
  options: QuestionOption[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
  difficulty: number;
  created_at?: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number;
  attempts: number;
  completed_at: string | null;
  time_spent_seconds: number;
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  preferred_language?: string;
  theme?: 'light' | 'dark' | 'system';
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_xp: number;
  level: number;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  date: string;
  task_type: 'learn' | 'quiz' | 'review';
  target_count: number;
  completed_count: number;
  reward_points: number;
};
