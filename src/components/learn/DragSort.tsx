"use client";

import { Reorder } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { QuestionOption } from "@/types/database";

type DragSortProps = {
  questionText: string;
  options: QuestionOption[];
  value: string[];
  onChange: (orderedIds: string[]) => void;
  disabled?: boolean;
};

export function DragSort({
  questionText,
  options,
  value,
  onChange,
  disabled,
}: DragSortProps) {
  const orderedIds = value.length > 0 ? value : options.map((o) => o.id);
  const items = orderedIds
    .map((id) => options.find((o) => o.id === id))
    .filter(Boolean) as QuestionOption[];

  return (
    <div className="space-y-4">
      <p className="text-foreground text-lg font-medium leading-snug">
        {questionText}
      </p>
      <p className="text-sm text-muted">拖拽调整顺序</p>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={(newOrder) => {
          if (!disabled) {
            onChange(newOrder.map((o) => o.id));
          }
        }}
        className="space-y-2"
      >
        {items.map((opt) => (
          <Reorder.Item
            key={opt.id}
            value={opt}
            dragListener={!disabled}
            className="flex items-center gap-2 min-h-[48px] px-4 py-3 rounded-button border-2 border-border bg-card text-foreground touch-manipulation cursor-grab active:cursor-grabbing"
          >
            {!disabled && (
              <GripVertical className="w-5 h-5 text-muted shrink-0" />
            )}
            <span className="flex-1">{opt.text}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
