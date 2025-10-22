import { getProgramWithSessions } from "@/lib/database/get-program-by-id";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";
import z from "zod";

export const GET = userRoute
  .params(z.object({ id: z.string() }))
  .handler(async (_req, { params }) => {
    const { id } = params;

    const program = await getProgramWithSessions(id);

    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    return NextResponse.json({ program });
  });
