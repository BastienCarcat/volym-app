import { z } from "zod";
import {
  CircuitType,
  CircuitItemType,
  DayOfWeek,
  SessionItemType,
  SetType,
} from "@/generated/prisma";

// ==========================================
// FORM SCHEMAS - For React Hook Form (uses .optional())
// ==========================================

// ==========================================
// SESSION
// ==========================================

export const createSessionFormSchema = z
  .object({
    programId: z.string().min(1, "programId is required"),
    templateId: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    day: z.enum(DayOfWeek).optional(),
    cycleDay: z.number().positive().optional(),
    isRestDay: z.boolean().optional(),
    weekNumber: z.number().positive().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      // Either day or cycleDay must be present, but not both
      return (data.day && !data.cycleDay) || (!data.day && data.cycleDay);
    },
    {
      message: "Either day or cycleDay must be provided, but not both",
    }
  );

export const sessionFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
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

export const setFormSchema = z.object({
  id: z.string().optional(),
  weight: z.number().positive("Weight must be positive").nullable(),
  reps: z.number().positive("Reps must be positive").nullable(),
  rest: z.number().positive().nullable(),
  type: z.enum(SetType),
  rpe: z.number().positive().nullable(),
  order: z.number().positive(),
});

// ==========================================
// EXERCISES
// ==========================================

export const exerciseFormSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, "exerciseId is required"),
  note: z.string().nullable(),
  sets: z.array(setFormSchema).min(1, "At least one set is required"),
});

// ==========================================
// CIRCUITS
// ==========================================

export const circuitFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(CircuitType),
  duration: z.number().positive().nullable(),
  rest: z.number().positive().nullable(),
  note: z.string().nullable(),
});

export const circuitItemFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(CircuitItemType),
  order: z.number().positive(),
  exercise: exerciseFormSchema.optional().nullable(),
});

export const circuitWithItemsFormSchema = circuitFormSchema.extend({
  circuitItems: z.array(circuitItemFormSchema),
});

// ==========================================
// SESSION ITEMS
// ==========================================

export const sessionItemFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(SessionItemType),
  order: z.number().positive(),
  exercise: exerciseFormSchema.optional().nullable(),
  circuit: circuitWithItemsFormSchema.optional().nullable(),
});

// ==========================================
// SESSION WITH ITEMS (for forms and server actions)
// ==========================================

export const sessionWithItemsFormSchema = sessionFormSchema.extend({
  sessionItems: z.array(sessionItemFormSchema),
});
