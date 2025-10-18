import { userRoute } from "@/lib/safe-route";
import { SafeRouteError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { z } from "zod";

import { upfetch } from "@/lib/up-fetch";
import { gymFitSearchExercisesResponseSchema } from "@/app/(root)/workouts/schemas";

const GYMFIT_API_BASE_URL = "https://gym-fit.p.rapidapi.com";

const searchParamsSchema = z.object({
  bodyPart: z
    .enum(["Legs", "Back", "Chest", "Shoulders", "Arms", "Core"])
    .optional(),
  query: z.string().optional(),
  offset: z.coerce.number().min(0).max(300).optional().default(0),
  number: z.coerce.number().min(1).max(50).optional().default(20),
});

export const GET = userRoute
  .query(searchParamsSchema)
  .handler(async (req, { query }) => {
    const apiKey = process.env.GYMFIT_API_KEY;

    if (!apiKey) {
      throw new SafeRouteError("GYMFIT_API_KEY is not configured", 500);
    }

    const searchParams = new URLSearchParams();
    if (query.bodyPart) searchParams.append("bodyPart", query.bodyPart);
    if (query.query) searchParams.append("query", query.query);
    searchParams.append("offset", query.offset.toString());
    searchParams.append("number", query.number.toString());

    const url = `${GYMFIT_API_BASE_URL}/v1/exercises/search?${searchParams.toString()}`;

    try {
      const response = await upfetch(url, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "gym-fit.p.rapidapi.com",
        },
        schema: gymFitSearchExercisesResponseSchema,
      });

      return NextResponse.json({
        exercises: response.results,
      });
    } catch (error) {
      if (error instanceof SafeRouteError) {
        throw error;
      }

      console.error("Error fetching exercises from Gym-Fit API:", error);
      throw new SafeRouteError("Failed to fetch exercises", 500);
    }
  });
