import z from "zod";
import { gymFitExerciseSchema, gymFitMinimalExerciseSchema } from "./schemas";

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
