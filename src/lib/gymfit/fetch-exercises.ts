import { upfetch } from "@/lib/up-fetch";
import { type GymFitExercise } from "./types";
import { gymFitExerciseSchema } from "../schemas/gymfit";

export async function fetchExerciseFromGymFit(
  exerciseId: string
): Promise<GymFitExercise> {
  const apiKey = process.env.GYMFIT_API_KEY;
  if (!apiKey) {
    throw new Error("GYMFIT_API_KEY is not configured");
  }

  const url = `${process.env.GYMFIT_API_BASE_URL}/v1/exercises/${exerciseId}`;

  const response = await upfetch(url, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
    },
    schema: gymFitExerciseSchema,
  });

  return response;
}

export async function fetchMultipleExercisesFromGymFit(
  exerciseIds: string[]
): Promise<Record<string, GymFitExercise>> {
  const exercises = await Promise.all(
    exerciseIds.map(async (id) => {
      try {
        const exercise = await fetchExerciseFromGymFit(id);
        return { id, exercise };
      } catch (error) {
        console.error(`Failed to fetch exercise ${id}:`, error);
        return { id, exercise: null };
      }
    })
  );

  return exercises.reduce(
    (acc, { id, exercise }) => {
      if (exercise) {
        acc[id] = exercise;
      }
      return acc;
    },
    {} as Record<string, GymFitExercise>
  );
}
