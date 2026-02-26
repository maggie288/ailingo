/**
 * AI-generated lesson JSON format for frontend LessonRenderer.
 * Matches the strict schema required by the product.
 */

// Card types
export type ConceptIntroCard = {
  type: "concept_intro";
  content: string;
  analogy?: string;
};

export type CodeGapFillCard = {
  type: "code_gap_fill";
  title: string;
  code_snippet: string;
  gap_index: number;
  gap_answer: string;
  hint?: string;
};

export type MultipleChoiceCard = {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type MatchPairsCard = {
  type: "match_pairs";
  title: string;
  pairs: Array<{ key: string; value: string }>;
};

export type LessonCard =
  | ConceptIntroCard
  | CodeGapFillCard
  | MultipleChoiceCard
  | MatchPairsCard;

export type GeneratedLessonJSON = {
  lesson_id: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  /** 本节学习目标，1～3 条，可被练习检验 */
  learning_objectives: string[];
  /** 通过标准 0～1，默认 0.8 */
  pass_threshold: number;
  cards: LessonCard[];
};

export type GeneratedLessonRow = {
  id: string;
  topic: string;
  difficulty: string;
  prerequisites: string[];
  learning_objectives: string[];
  pass_threshold: number;
  cards: LessonCard[];
  source_type: string | null;
  source_id: string | null;
  source_url: string | null;
  status: string;
  knowledge_node_id: string | null;
  created_at: string;
  updated_at: string;
};
