import { NextResponse } from "next/server";
import { getSessionById } from "@/lib/database/get-session-by-id";
import { userRoute } from "@/lib/safe-route";
import { SafeRouteError } from "@/lib/errors";
import z from "zod";

export const GET = userRoute
  .params(z.object({ id: z.string() }))
  .handler(async (_req, { params }) => {
    const { id } = params;

    const session = await getSessionById(id);

    if (!session) {
      throw new SafeRouteError("Session not found", 404);
    }

    return NextResponse.json({ session }, { status: 200 });
  });
