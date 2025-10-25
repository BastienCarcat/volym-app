import { z } from "zod";
import { DayOfWeek, SetType } from "@/generated/prisma";
import { BodyPart } from "./types";

// **************** session ****************

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
  id: z.string().optional(), // Optional for new sets
  weight: z.number().positive("Kg > 0"),
  reps: z.number().positive("Reps > 0"),
  rest: z.number().positive().nullable(),
  type: z.enum(SetType),
  rpe: z.number().positive().nullable(),
  order: z.number().positive(),
});

export const sessionExerciseSchema = z.object({
  id: z.string().optional(), // Optional for new exercises
  note: z.string().nullable(),
  order: z.number().positive(),
  exerciseId: z.string().min(1, "exerciseId is required"),
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

// *********** GymFit **************

export const gymFitMinimalExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  bodyPart: z.enum(BodyPart),
  image: z.string(),
});

export const gymFitSearchExercisesResponseSchema = z.object({
  results: z.array(gymFitMinimalExerciseSchema),
});

export const gymFitMuscleSchema = z.object({
  id: z.string(),
  bodyPart: z.enum(BodyPart),
  name: z.string(),
  group: z.string().nullable(),
});

export const gymFitExerciseSchema = z.object({
  name: z.string(),
  targetMuscles: z.array(gymFitMuscleSchema),
  secondaryMuscles: z.array(gymFitMuscleSchema),
  equipment: z.string(), //TODO: make enum
  bodyPart: z.enum(BodyPart),
  image: z.string(),
  variations: z.array(gymFitMinimalExerciseSchema),
  instructions: z.array(
    z.object({
      order: z.number(),
      description: z.string(),
    })
  ),
});

export const SearchExercisesFiltersSchema = z.object({
  query: z.string().optional(),
  bodyPart: z.enum(BodyPart).optional(),
  equipment: z.string().optional(),
});
