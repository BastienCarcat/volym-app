// Exercise Types matching API format

export interface Muscle {
  id: string;
  name: string;
  bodyPart: string;
  group: string | null;
}

export interface ExerciseVariation {
  id: string;
  name: string;
  bodyPart: string;
  image: string;
}

export interface ExerciseInstruction {
  order: number;
  description: string;
}

export interface Exercise {
  id: string;
  bodyPart: string;
  image: string;
  name: string;
  equipment: string;
  variations?: ExerciseVariation[];
  instructions?: ExerciseInstruction[];
  targetMuscles: Muscle[];
  secondaryMuscles: Muscle[];
}

// Workout Exercise (when added to a workout)
export interface WorkoutExercise {
  id: string; // Unique ID for this workout exercise instance
  exerciseId: string; // Original exercise ID from Exercise.id
  name: string;
  bodyPart: string;
  image: string;
  equipment: string;
  targetMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  order: number; // Order in the workout
  createdAt: Date;
}

// Simplified type for forms and simple operations
export interface SimpleExercise {
  id: string;
  name: string;
  bodyPart: string;
  image: string;
  equipment: string;
  targetMuscles: Muscle[];
  secondaryMuscles: Muscle[];
}

// Legacy DTO
interface CreateWorkoutDto {
  name: string;
  note?: string;
}
