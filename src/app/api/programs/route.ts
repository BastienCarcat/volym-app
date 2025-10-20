import { getPrograms } from "@/lib/database/get-programs";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";

export const GET = userRoute.handler(async (_req, { ctx }) => {
  const programs = await getPrograms(ctx.currentUser.dbUser.id);

  if (!programs) {
    throw new SafeRouteError("Can't get programs from user", 404);
  }

  return NextResponse.json({ programs });
});
