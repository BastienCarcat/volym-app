import { z } from "zod";
import {
  gymFitExerciseSchema,
  gymFitMinimalExerciseSchema,
  gymFitMuscleSchema,
  SearchExercisesFiltersSchema,
} from "../schemas/gymfit";

export enum BodyPart {
  Legs = "Legs",
  Back = "Back",
  Chest = "Chest",
  Shoulders = "Shoulders",
  Arms = "Arms",
  Core = "Core",
}

export type GymFitMinimalExercise = z.infer<typeof gymFitMinimalExerciseSchema>;
export type GymFitExercise = z.infer<typeof gymFitExerciseSchema>;
export type GymFitMuscle = z.infer<typeof gymFitMuscleSchema>;
export type SearchExercisesFilters = z.infer<
  typeof SearchExercisesFiltersSchema
>;
