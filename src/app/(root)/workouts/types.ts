import { Prisma } from "@/generated/prisma";
import { z } from "zod";
import {
  gymFitExerciseSchema,
  gymFitMinimalExerciseSchema,
  workoutWithExercisesSchema,
} from "./schemas";

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

export enum BodyPart {
  Legs = "Legs",
  Back = "Back",
  Chest = "Chest",
  Shoulders = "Shoulders",
  Arms = "Arms",
  Core = "Core",
}

export type WorkoutFormValues = z.infer<typeof workoutWithExercisesSchema>;

export type GymFitMinimalExercise = z.infer<typeof gymFitMinimalExerciseSchema>;
export type GymFitExercise = z.infer<typeof gymFitExerciseSchema>;
