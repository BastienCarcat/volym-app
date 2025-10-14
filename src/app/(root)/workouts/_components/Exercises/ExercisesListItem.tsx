import Image from "next/image";
import { Dumbbell } from "lucide-react";
import { Exercise } from "../../types";

interface ExercisesListItemProps {
  exercise: Exercise;
  onSelect: (exerciseId: string) => void;
}

export function ExerciseListItem({
  exercise,
  onSelect,
}: ExercisesListItemProps) {
  return (
    <div
      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
      onClick={() => onSelect(exercise.id)}
    >
      <div className="flex items-center gap-3">
        {/* Exercise thumbnail */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
          {exercise.image ? (
            <Image
              src={exercise.image}
              alt={exercise.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Exercise info */}
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{exercise.name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs">
              {exercise.bodyPart}
            </span>
            <span>•</span>
            <span>{exercise.equipment}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
