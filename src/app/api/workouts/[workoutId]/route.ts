import { getWorkoutById } from "@/lib/database/get-workout-by-id";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";
import z from "zod";

export const GET = userRoute
  .params(
    z.object({
      workoutId: z.uuidv4(),
    })
  )
  .handler(async (req, { ctx, params }) => {
    const { workoutId } = params;

    const workout = await getWorkoutById(workoutId, ctx.currentUser.dbUser.id);

    if (!workout) {
      throw new SafeRouteError("Workout not found", 404);
    }

    return NextResponse.json({ workout });
  });
