import { z } from "zod";

export const exerciseSetFieldSchemas = {
  weight: z
    .number()
    .min(0, "Weight must be positive")
    .max(9999, "Weight cannot exceed 9999Kg")
    .optional(),
  reps: z
    .number()
    .int()
    .min(0, "Reps must be positive")
    .max(999, "Reps cannot exceed 999")
    .optional(),
  rest: z
    .number()
    .int()
    .min(0, "Rest must be positive")
    .max(3600, "Rest cannot exceed 1 hour")
    .optional(),
  rpe: z
    .number()
    .min(1, "RPE must be between 1 and 10")
    .max(10, "RPE must be between 1 and 10")
    .optional(),
  type: z.enum(["WarmUp", "Normal", "DropsSet", "Failure"]).optional(),
};

export const exerciseSetSchema = z.object({
  weight: exerciseSetFieldSchemas.weight,
  reps: exerciseSetFieldSchemas.reps,
  rest: exerciseSetFieldSchemas.rest,
  rpe: exerciseSetFieldSchemas.rpe,
});

export type ExerciseSetFormData = z.infer<typeof exerciseSetSchema>;

export const workoutNoteSchema = z
  .string()
  .max(500, "Note cannot exceed 500 characters")
  .optional();
