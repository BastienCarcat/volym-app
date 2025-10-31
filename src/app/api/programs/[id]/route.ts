import { getProgramWithFullSessions } from "@/lib/database/get-program-by-id";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";
import z from "zod";
import { fetchMultipleExercisesFromGymFit } from "@/lib/gymfit/fetch-exercises";

export const GET = userRoute
  .params(z.object({ id: z.string() }))
  .handler(async (_req, { params }) => {
    const { id } = params;

    const program = await getProgramWithFullSessions(id);
    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    const exerciseIds = new Set<string>();

    // Collect all exercise IDs from the program
    for (const session of program.sessions) {
      for (const sessionItem of session.sessionItems) {
        // Collect exerciseId from direct exercise
        if (sessionItem.exercise?.exerciseId) {
          exerciseIds.add(sessionItem.exercise.exerciseId);
        }

        // Collect exerciseIds from circuit items
        if (sessionItem.circuit?.circuitItems) {
          for (const circuitItem of sessionItem.circuit.circuitItems) {
            if (circuitItem.exercise?.exerciseId) {
              exerciseIds.add(circuitItem.exercise.exerciseId);
            }
          }
        }
      }
    }

    const exercises = await fetchMultipleExercisesFromGymFit(
      Array.from(exerciseIds)
    );

    return NextResponse.json({
      program: {
        ...program,
        exercises,
      },
    });
  });
