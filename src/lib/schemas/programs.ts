import { z } from "zod";
import { sessionWithItemsDbSchema } from "./sessions.schema";
import { gymFitExerciseSchema } from "./gymfit";
import { ProgramType, ProgramObjective } from "@/generated/prisma";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(ProgramType).default("Days"),
  objective: z.enum(ProgramObjective).optional(),
});

export const programSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  type: z.enum(ProgramType),
});

export const programWithFullSessionsSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  type: z.enum(ProgramType),
  objective: z.enum(ProgramObjective).nullable(),
  sessions: z.array(sessionWithItemsDbSchema),
});

export const programWithFullSessionsAndExercisesSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  type: z.enum(ProgramType),
  objective: z.enum(ProgramObjective).nullable(),
  sessions: z.array(sessionWithItemsDbSchema),
  exercises: z.record(z.string(), gymFitExerciseSchema),
});
