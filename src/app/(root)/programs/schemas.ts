import { z } from "zod";
import { DayOfWeek, SetType } from "@/generated/prisma";

// **************** session ****************

export const createSessionSchema = z.object({
  programId: z.string().min(1, "programId is required"),
  templateId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  day: z.enum(DayOfWeek),
  weekNumber: z.number().int().positive().optional(),
  note: z.string().optional(),
});

export const sessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  day: z.enum(DayOfWeek),
  weekNumber: z.number().nullable(),
  templateId: z.string().nullable(),
});

export const sessionSetSchema = z.object({
  id: z.string(),
  weight: z.number(),
  reps: z.number(),
  rest: z.number().nullable(),
  type: z.enum(SetType),
  rpe: z.number().nullable(),
  order: z.number(),
});

export const sessionExerciseSchema = z.object({
  id: z.string(),
  note: z.string().nullable(),
  order: z.number(),
  exerciseId: z.string(),
  supersetId: z.string().nullable(),
  sets: z.array(sessionSetSchema),
});

export const sessionWithExercisesSchema = sessionSchema.extend({
  exercises: z.array(sessionExerciseSchema),
});

// **************** program ****************

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const programSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
});

export const programWithSessionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  sessions: z.array(sessionSchema),
});

// **************** templates ****************

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
