"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/form/fields/inputs/input";
import { DurationInput } from "@/components/form/fields/inputs/duration-input";
import type { SetData } from "../../../[id]/WorkoutPageClient";

interface ExerciseSetRowProps {
  set: SetData;
  index: number;
  onUpdate: (updates: Partial<SetData>) => void;
  onAddSet: (insertAfterIndex: number) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

export function ExerciseSetRow({
  set,
  index,
  onUpdate,
  onAddSet,
  onRemoveSet,
  canRemove,
}: ExerciseSetRowProps) {

  return (
    <div className="contents">
      <Badge
        variant="outline"
        className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {index + 1}
      </Badge>
      <Input
        type="number"
        value={set.weight?.toString() || ""}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : null;
          onUpdate({ weight: newValue });
        }}
        placeholder="0"
        min={0}
        className="text-right"
      />
      <Input
        type="number"
        value={set.reps?.toString() || ""}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : null;
          onUpdate({ reps: newValue });
        }}
        placeholder="0"
        min={0}
        className="text-right"
      />
      <DurationInput
        value={set.rest}
        onChange={(value) => {
          onUpdate({ rest: value });
        }}
        placeholder="0:00"
        className="text-right"
      />
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(index)}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveSet}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
          disabled={!canRemove}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
