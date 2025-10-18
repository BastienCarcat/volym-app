import { userRoute } from "@/lib/safe-route";
import { SafeRouteError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { z } from "zod";

import { upfetch } from "@/lib/up-fetch";
import { gymFitExerciseSchema } from "@/app/(root)/workouts/schemas";

const GYMFIT_API_BASE_URL = "https://gym-fit.p.rapidapi.com";

const pathParamsSchema = z.object({
  exerciseId: z.string(),
});

export const GET = userRoute
  .params(pathParamsSchema)
  .handler(async (req, { params }) => {
    const apiKey = process.env.GYMFIT_API_KEY;
    if (!apiKey) {
      throw new SafeRouteError("GYMFIT_API_KEY is not configured", 500);
    }

    const url = `${GYMFIT_API_BASE_URL}/v1/exercises/${params.exerciseId}`;

    try {
      const response = await upfetch(url, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
        },
        schema: gymFitExerciseSchema,
      });

      return NextResponse.json({
        exercise: response,
      });
    } catch (error) {
      if (error instanceof SafeRouteError) {
        throw error;
      }

      console.error(
        `Error fetching exercise (${params.exerciseId}) from Gym-Fit API:`,
        error
      );
      throw new SafeRouteError("Failed to fetch exercise", 500);
    }
  });
