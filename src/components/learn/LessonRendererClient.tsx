"use client";

import { LessonRenderer } from "@/components/learn/LessonRenderer";
import type { GeneratedLessonJSON } from "@/types/generated-lesson";

type Props = { lesson: GeneratedLessonJSON };

export function LessonRendererClient({ lesson }: Props) {
  return <LessonRenderer lesson={lesson} />;
}
