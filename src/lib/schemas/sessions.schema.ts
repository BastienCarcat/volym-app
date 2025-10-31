import { z } from "zod";
import {
  CircuitType,
  CircuitItemType,
  DayOfWeek,
  SessionItemType,
  SetType,
} from "@/generated/prisma";

// ==========================================
// DB SCHEMAS - For data from Prisma (uses .nullable())
// ==========================================

// ==========================================
// SESSION
// ==========================================

export const sessionDbSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  day: z.enum(DayOfWeek).nullable(),
  cycleDay: z.number().positive().nullable(),
  isRestDay: z.boolean(),
  weekNumber: z.number().positive().nullable(),
  templateId: z.string().nullable(),
});

// ==========================================
// SETS
// ==========================================

export const setDbSchema = z.object({
  id: z.string(),
  weight: z.number().positive().nullable(),
  reps: z.number().positive().nullable(),
  rest: z.number().positive().nullable(),
  type: z.enum(SetType),
  rpe: z.number().positive().nullable(),
  order: z.number().positive(),
});

// ==========================================
// EXERCISES
// ==========================================

export const exerciseDbSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  note: z.string().nullable(),
  sets: z.array(setDbSchema),
});

// ==========================================
// CIRCUITS
// ==========================================

export const circuitDbSchema = z.object({
  id: z.string(),
  type: z.enum(CircuitType),
  duration: z.number().positive().nullable(),
  rest: z.number().positive().nullable(),
  note: z.string().nullable(),
});

export const circuitItemDbSchema = z.object({
  id: z.string(),
  type: z.enum(CircuitItemType),
  order: z.number().positive(),
  exercise: exerciseDbSchema.nullable(),
});

export const circuitWithItemsDbSchema = circuitDbSchema.extend({
  circuitItems: z.array(circuitItemDbSchema),
});

// ==========================================
// SESSION ITEMS
// ==========================================

export const sessionItemDbSchema = z.object({
  id: z.string(),
  type: z.enum(SessionItemType),
  order: z.number().positive(),
  exercise: exerciseDbSchema.nullable(),
  circuit: circuitWithItemsDbSchema.nullable(),
});

// ==========================================
// SESSION WITH ITEMS
// ==========================================

export const sessionWithItemsDbSchema = sessionDbSchema.extend({
  sessionItems: z.array(sessionItemDbSchema),
});
