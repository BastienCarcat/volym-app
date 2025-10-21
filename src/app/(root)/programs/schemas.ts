import { z } from "zod";
import { DayOfWeek } from "./types";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const dayOfWeekSchema = z.enum([
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
]);

export const programScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  day: dayOfWeekSchema,
  workoutId: z.string().uuid().nullable(),
});

export const programWithScheduleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  note: z.string().nullable(),
  schedules: z.array(programScheduleSchema),
});

export const saveProgramSchema = programWithScheduleSchema;
