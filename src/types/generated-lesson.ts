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
  cards: LessonCard[];
};

export type GeneratedLessonRow = {
  id: string;
  topic: string;
  difficulty: string;
  prerequisites: string[];
  cards: LessonCard[];
  source_type: string | null;
  source_id: string | null;
  source_url: string | null;
  status: string;
  knowledge_node_id: string | null;
  created_at: string;
  updated_at: string;
};
