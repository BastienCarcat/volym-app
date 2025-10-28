import { z } from "zod";
import { sessionWithExercisesSchema } from "./sessions";
import { gymFitExerciseSchema } from "./gymfit";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const programSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
});

export const programWithFullSessionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  sessions: z.array(sessionWithExercisesSchema),
});

export const programWithFullSessionsAndExercisesSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  sessions: z.array(sessionWithExercisesSchema),
  exercises: z.record(z.string(), gymFitExerciseSchema),
});
