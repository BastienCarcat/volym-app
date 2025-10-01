import { Dumbbell } from "lucide-react";
import Image from "next/image";
import type { WorkoutExercise } from "../types";

interface ExerciseCardProps {
  id: string;
  name: string;
  bodyPart: string;
  image: string;
  equipment: string;
  targetMuscles: WorkoutExercise["targetMuscles"];
  secondaryMuscles: WorkoutExercise["secondaryMuscles"];
}

export function ExerciseCard({ 
  name, 
  bodyPart, 
  image, 
  equipment, 
  targetMuscles, 
  secondaryMuscles 
}: ExerciseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex gap-4">
        {/* Left side: exercise image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        {/* Right side: content */}
        <div className="flex-1">
          {/* Exercise name and body part */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
              {bodyPart}
            </span>
          </div>

          {/* Equipment */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm text-gray-600">Equipment:</span>
            <span className="text-sm font-medium text-gray-800">{equipment}</span>
          </div>
          
          {/* Target Muscles */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Primary Muscles</h4>
            <div className="flex flex-wrap gap-1">
              {targetMuscles.map((muscle) => (
                <span
                  key={muscle.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {muscle.name}
                </span>
              ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          {secondaryMuscles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Secondary Muscles</h4>
              <div className="flex flex-wrap gap-1">
                {secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                  >
                    {muscle.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Placeholder sections for sets and notes */}
          <div className="space-y-3">
            {/* Sets placeholder */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sets</h4>
              <div className="text-sm text-gray-500 italic">
                Sets will be added here...
              </div>
            </div>
            
            {/* Notes placeholder */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <div className="text-sm text-gray-500 italic">
                Exercise notes will be added here...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}