import { z } from "zod";
import { DayOfWeek, SetType } from "@/generated/prisma";

export const createSessionSchema = z.object({
  programId: z.string().min(1, "programId is required"),
  templateId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  day: z.enum(DayOfWeek),
  weekNumber: z.number().positive().optional(),
  note: z.string().optional(),
});

export const sessionSchema = z.object({
  id: z.string().min(1, "id is required"),
  name: z.string().min(1, "Name is required"),
  note: z.string().nullable(),
  day: z.enum(DayOfWeek),
  weekNumber: z.number().positive().nullable(),
  templateId: z.string().nullable(),
});

export const sessionSetSchema = z.object({
  id: z.string().optional(),
  weight: z.number(" ").positive("Kg > 0"),
  reps: z.number(" ").positive("Reps > 0"),
  rest: z.number().positive().nullable(),
  type: z.enum(SetType),
  rpe: z.number().positive().nullable(),
  order: z.number().positive(),
});

export const sessionExerciseSchema = z.object({
  id: z.string().optional(),
  note: z.string().nullable(),
  order: z.number().positive(),
  exerciseId: z.string().min(1, "exerciseId is required"),
  supersetId: z.string().nullable(),
  sets: z.array(sessionSetSchema),
});

export const sessionWithExercisesSchema = sessionSchema.extend({
  exercises: z.array(sessionExerciseSchema),
});
