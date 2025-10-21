import { getProgramWithSchedule } from "@/lib/database/get-program";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";

type RouteContext = {
  ctx: {
    currentUser: {
      dbUser: {
        id: string;
      };
    };
  };
  params: Promise<{ id: string }>;
};

export const GET = userRoute.handler(
  async (_req, { ctx, params }: RouteContext) => {
    const { id } = await params;

    const program = await getProgramWithSchedule(id);

    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    if (program.createdBy !== ctx.currentUser.dbUser.id) {
      throw new SafeRouteError("Unauthorized", 403);
    }

    return NextResponse.json({ program });
  }
);
