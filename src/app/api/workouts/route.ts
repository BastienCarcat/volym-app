import { getWorkouts } from "@/lib/database/get-workouts";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";

export const GET = userRoute.handler(async (req, { ctx }) => {
  const workouts = await getWorkouts(ctx.currentUser.dbUser.id);

  if (!workouts) {
    throw new SafeRouteError("Can't get workouts from user", 404);
  }

  return NextResponse.json({ workouts });
});
