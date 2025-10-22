import { getTemplates } from "@/lib/database/get-templates";
import { SafeRouteError } from "@/lib/errors";
import { userRoute } from "@/lib/safe-route";
import { NextResponse } from "next/server";

export const GET = userRoute.handler(async (_req, { ctx }) => {
  const templates = await getTemplates(ctx.currentUser.dbUser.id);

  if (!templates) {
    throw new SafeRouteError("Can't get templates from user", 404);
  }

  return NextResponse.json({ templates });
});
