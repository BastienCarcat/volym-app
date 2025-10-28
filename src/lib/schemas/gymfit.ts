import z from "zod";
import { BodyPart } from "../gymfit/types";

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
