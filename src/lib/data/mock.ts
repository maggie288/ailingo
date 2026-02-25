/**
 * Mock data for Phase 2: works without Supabase.
 * Types match src/types/database.ts
 */

import type { Course, Unit, Lesson, Question } from "@/types/database";

export const MOCK_COURSES: Course[] = [
  {
    id: "course-1",
    title: "大模型入门",
    description: "从零理解什么是大语言模型，掌握基本概念与使用方式。",
    icon_url: null,
    difficulty: "beginner",
    estimated_hours: 3,
    color: "#58CC02",
    is_ai_generated: false,
    status: "published",
    created_by: "",
  },
  {
    id: "course-2",
    title: "Transformer 架构",
    description: "深入理解 Self-Attention、位置编码与编码器-解码器结构。",
    icon_url: null,
    difficulty: "intermediate",
    estimated_hours: 5,
    color: "#CE82FF",
    is_ai_generated: false,
    status: "published",
    created_by: "",
  },
  {
    id: "course-3",
    title: "提示工程与实践",
    description: "编写高质量提示词，提升模型输出效果。",
    icon_url: null,
    difficulty: "beginner",
    estimated_hours: 2,
    color: "#FF9600",
    is_ai_generated: false,
    status: "published",
    created_by: "",
  },
];

export const MOCK_UNITS: Record<string, Unit[]> = {
  "course-1": [
    { id: "unit-1-1", course_id: "course-1", order_index: 0, title: "什么是大模型", description: "基本概念", color: "#58CC02", unlock_condition: null },
    { id: "unit-1-2", course_id: "course-1", order_index: 1, title: "Token 与上下文", description: "理解输入输出", color: "#58CC02", unlock_condition: null },
  ],
  "course-2": [
    { id: "unit-2-1", course_id: "course-2", order_index: 0, title: "Self-Attention", description: "注意力机制", color: "#CE82FF", unlock_condition: null },
    { id: "unit-2-2", course_id: "course-2", order_index: 1, title: "编码器与解码器", description: "整体架构", color: "#CE82FF", unlock_condition: null },
  ],
  "course-3": [
    { id: "unit-3-1", course_id: "course-3", order_index: 0, title: "提示词基础", description: "零样本与少样本", color: "#FF9600", unlock_condition: null },
  ],
};

export const MOCK_LESSONS: Record<string, Lesson[]> = {
  "unit-1-1": [
    {
      id: "lesson-1-1-1",
      unit_id: "unit-1-1",
      knowledge_node_id: null,
      title: "大模型是什么",
      type: "theory",
      content: `## 大模型是什么

**大语言模型（LLM）** 是基于海量文本训练的深度学习模型，能够理解和生成自然语言。

### 核心特点
- **规模大**：参数量从数亿到数千亿
- **通用性**：可完成翻译、摘要、问答、代码等多种任务
- **少样本学习**：通过少量示例即可适应新任务

### 常见模型
- GPT 系列（OpenAI）
- LLaMA（Meta）
- 文心、通义等国产模型
`,
      order_index: 0,
      duration_minutes: 5,
    },
    {
      id: "lesson-1-1-2",
      unit_id: "unit-1-1",
      knowledge_node_id: null,
      title: "大模型能做什么",
      type: "mixed",
      content: `## 大模型能做什么

大模型可以完成多种 **NLP（自然语言处理）** 任务：

1. **文本生成**：续写、创作、翻译
2. **问答与推理**：基于上下文回答问题
3. **代码**：补全、解释、转换
4. **摘要与抽取**：长文摘要、关键信息提取
`,
      order_index: 1,
      duration_minutes: 5,
    },
  ],
  "unit-1-2": [
    {
      id: "lesson-1-2-1",
      unit_id: "unit-1-2",
      knowledge_node_id: null,
      title: "Token 是什么",
      type: "theory",
      content: `## Token

**Token** 是模型处理文本的基本单位，通常对应一个词或子词。

- 英文约 1 token ≈ 4 字符
- 中文约 1 token ≈ 1–2 个汉字
- 模型有 **上下文长度** 限制（如 4K、8K、128K tokens）
`,
      order_index: 0,
      duration_minutes: 5,
    },
  ],
  "unit-2-1": [
    {
      id: "lesson-2-1-1",
      unit_id: "unit-2-1",
      knowledge_node_id: null,
      title: "注意力机制简介",
      type: "theory",
      content: `## Self-Attention

**Self-Attention（自注意力）** 让序列中每个位置都能关注到其他所有位置，从而捕捉长距离依赖。

\`\`\`text
Query, Key, Value 来自同一输入，通过线性变换得到。
Attention(Q,K,V) = softmax(QK^T / √d_k) V
\`\`\`
`,
      order_index: 0,
      duration_minutes: 8,
    },
  ],
  "unit-2-2": [],
  "unit-3-1": [
    {
      id: "lesson-3-1-1",
      unit_id: "unit-3-1",
      knowledge_node_id: null,
      title: "什么是提示词",
      type: "theory",
      content: `## 提示词（Prompt）

**提示词** 是你写给模型的指令和上下文，用于引导模型输出。

- **零样本**：只给任务描述，不给示例
- **少样本**：给 1～几个示例再让模型仿写
- **思维链**：让模型“一步步思考”再给答案
`,
      order_index: 0,
      duration_minutes: 5,
    },
  ],
};

export const MOCK_QUESTIONS: Record<string, Question[]> = {
  "lesson-1-1-1": [
    {
      id: "q-1-1-1-1",
      lesson_id: "lesson-1-1-1",
      type: "multiple_choice",
      question_text: "大语言模型（LLM）的主要特点不包括以下哪一项？",
      options: [
        { id: "a", text: "参数量大", isCorrect: false },
        { id: "b", text: "只能做翻译", isCorrect: true },
        { id: "c", text: "可完成多种 NLP 任务", isCorrect: false },
        { id: "d", text: "支持少样本学习", isCorrect: false },
      ],
      correct_answer: "b",
      explanation: "大模型是通用模型，可做翻译、问答、代码、摘要等多种任务，并非只能做翻译。",
      points: 10,
      difficulty: 1,
    },
    {
      id: "q-1-1-1-2",
      lesson_id: "lesson-1-1-1",
      type: "boolean",
      question_text: "大模型通常基于海量文本进行训练。",
      options: [
        { id: "true", text: "正确", isCorrect: true },
        { id: "false", text: "错误", isCorrect: false },
      ],
      correct_answer: "true",
      explanation: "是的，大语言模型通过在海量文本上进行预训练来学习语言表示与生成能力。",
      points: 10,
      difficulty: 1,
    },
  ],
  "lesson-1-1-2": [
    {
      id: "q-1-1-2-1",
      lesson_id: "lesson-1-1-2",
      type: "multiple_choice",
      question_text: "以下哪项不是大模型常见的应用场景？",
      options: [
        { id: "a", text: "文本摘要", isCorrect: false },
        { id: "b", text: "代码补全", isCorrect: false },
        { id: "c", text: "实时语音转写", isCorrect: true },
        { id: "d", text: "问答与推理", isCorrect: false },
      ],
      correct_answer: "c",
      explanation: "实时语音转写通常由专门的语音识别模型完成；大模型更常用于文本类任务。",
      points: 10,
      difficulty: 1,
    },
  ],
  "lesson-1-2-1": [
    {
      id: "q-1-2-1-1",
      lesson_id: "lesson-1-2-1",
      type: "multiple_choice",
      question_text: "关于 Token，以下说法正确的是？",
      options: [
        { id: "a", text: "1 个 token 固定等于 1 个汉字", isCorrect: false },
        { id: "b", text: "Token 是模型处理文本的基本单位", isCorrect: true },
        { id: "c", text: "模型没有上下文长度限制", isCorrect: false },
        { id: "d", text: "英文 1 token 约等于 1 个单词", isCorrect: false },
      ],
      correct_answer: "b",
      explanation: "Token 是模型的基本单位，中文约 1–2 字/token，英文约 4 字符/token；模型有上下文窗口限制。",
      points: 10,
      difficulty: 1,
    },
  ],
  "lesson-2-1-1": [
    {
      id: "q-2-1-1-1",
      lesson_id: "lesson-2-1-1",
      type: "multiple_choice",
      question_text: "Self-Attention 中，Query、Key、Value 的来源是？",
      options: [
        { id: "a", text: "来自三个不同的输入", isCorrect: false },
        { id: "b", text: "来自同一输入经不同线性变换", isCorrect: true },
        { id: "c", text: "只有 Query 来自输入", isCorrect: false },
        { id: "d", text: "与输入无关", isCorrect: false },
      ],
      correct_answer: "b",
      explanation: "在 Self-Attention 中，Q、K、V 均由同一输入通过不同的线性变换得到。",
      points: 15,
      difficulty: 2,
    },
  ],
  "lesson-3-1-1": [
    {
      id: "q-3-1-1-1",
      lesson_id: "lesson-3-1-1",
      type: "multiple_choice",
      question_text: "「只给任务描述、不给示例」的用法通常称为？",
      options: [
        { id: "a", text: "少样本学习", isCorrect: false },
        { id: "b", text: "零样本学习", isCorrect: true },
        { id: "c", text: "思维链", isCorrect: false },
        { id: "d", text: "微调", isCorrect: false },
      ],
      correct_answer: "b",
      explanation: "零样本（zero-shot）指仅通过任务描述引导模型，不提供示例。",
      points: 10,
      difficulty: 1,
    },
  ],
};

/** All lesson IDs that have questions (for mock) */
export function getMockQuestionsByLessonId(lessonId: string): Question[] {
  return MOCK_QUESTIONS[lessonId] ?? [];
}

/** Flatten all lessons for a course (for progress calculation) */
export function getMockLessonsByCourseId(courseId: string): { lesson: Lesson; unit: Unit }[] {
  const units = MOCK_UNITS[courseId] ?? [];
  const result: { lesson: Lesson; unit: Unit }[] = [];
  for (const unit of units) {
    const lessons = MOCK_LESSONS[unit.id] ?? [];
    for (const lesson of lessons) {
      result.push({ lesson, unit });
    }
  }
  return result;
}
