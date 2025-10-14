import { z } from "zod";

export const createWorkoutSchema = z.object({
  name: z.string().min(1).default("New Workout"),
  note: z.string().optional(),
});
