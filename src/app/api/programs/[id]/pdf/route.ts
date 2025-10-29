import { getProgramWithFullSessions } from "@/lib/database/get-program-by-id";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";
import z from "zod";
import { fetchMultipleExercisesFromGymFit } from "@/lib/gymfit/fetch-exercises";
import { generateProgramPDF } from "@/lib/pdf/generate-program-pdf";
import _ from "lodash";

export const GET = userRoute
  .params(z.object({ id: z.string() }))
  .handler(async (_req, { params }) => {
    const { id } = params;

    const program = await getProgramWithFullSessions(id);

    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    // Collect all exercise IDs
    const exerciseIds: string[] = [];
    program.sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        exerciseIds.push(exercise.exerciseId);
      });
    });

    // Fetch exercise details from GymFit
    const exercises = await fetchMultipleExercisesFromGymFit(
      _.uniq(exerciseIds)
    );

    // Generate PDF
    const pdfBlob = generateProgramPDF({
      program: {
        ...program,
        exercises,
      },
      exercises,
    });

    // Convert Blob to Buffer for Next.js response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const filename = `${program.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });
