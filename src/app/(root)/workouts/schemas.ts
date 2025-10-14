import { z } from "zod";

export const exerciseSetSchema = z.object({
  id: z.uuidv4().optional(), // Optional for new sets
  weight: z
    .number()
    .min(0, "Weight must be positive")
    .max(9999, "Weight cannot exceed 9999Kg"),
  reps: z
    .number()
    .min(0, "Reps must be positive")
    .max(999, "Reps cannot exceed 999"),
  rest: z
    .number()
    .min(0, "Rest must be positive")
    .max(5999, "Rest cannot exceed 99 minutes")
    .nullable(),
  rpe: z
    .number()
    .min(1, "RPE must be between 1 and 10")
    .max(10, "RPE must be between 1 and 10")
    .nullable()
    .optional(),
  type: z.enum(["WarmUp", "Normal", "DropsSet", "Failure"]).default("Normal"),
  order: z.number(),
});

export const workoutExerciseSchema = z.object({
  id: z.uuidv4().optional(), // Optional for new exercises
  exerciseId: z.uuidv4(),
  note: z.string().nullable().optional(),
  order: z.number(),
  sets: z.array(exerciseSetSchema),
});

export const saveWorkoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  note: z.string().nullable().optional(),
  exercises: z.array(workoutExerciseSchema),
});
