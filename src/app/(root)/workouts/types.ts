import { Prisma } from "@/generated/prisma";
import { z } from "zod";
import { workoutWithExercisesSchema } from "./schemas";

export const getWorkoutByIdSelect = Prisma.validator<Prisma.WorkoutSelect>()({
  id: true,
  name: true,
  note: true,
  exercises: {
    orderBy: { order: "asc" },
    select: {
      id: true,
      note: true,
      order: true,
      exerciseId: true,
      // supersetId: true,
      sets: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          weight: true,
          reps: true,
          rest: true,
          type: true,
          rpe: true,
          order: true,
        },
      },
    },
  },
});

export type WorkoutWithExercisesAndSets = Prisma.WorkoutGetPayload<{
  select: typeof getWorkoutByIdSelect;
}>;

export type ExerciseData = WorkoutWithExercisesAndSets["exercises"];

// Additional types for the form and components
export interface Exercise {
  id: string;
  name: string;
  image: string | null;
  bodyPart: string;
  equipment: string;
  targetMuscles: {
    id: string;
    name: string;
    bodyPart: string;
    group: string | null;
  }[];
  secondaryMuscles: {
    id: string;
    name: string;
    bodyPart: string;
    group: string | null;
  }[];
}

export type WorkoutFormValues = z.infer<typeof workoutWithExercisesSchema>;

// export interface SetData {
//   weight: number | null;
//   reps: number | null;
//   rest: number;
//   type: "WarmUp" | "Normal" | "DropsSet" | "Failure";
//   rpe: number | null;
//   order: number;
// }

// export interface ExerciseData {
//   exerciseId: string;
//   note: string;
//   order: number;
//   sets: SetData[];
// }
