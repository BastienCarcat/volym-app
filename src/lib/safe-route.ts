import { createZodRoute } from "next-zod-route";
import { NextRequest, NextResponse } from "next/server";
import { ApplicationError, SafeRouteError } from "./errors";
import { getCurrentUser } from "./auth/getUser";

export const routeClient = createZodRoute({
  handleServerError: (error) => {
    if (error instanceof SafeRouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ApplicationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  },
});

export const userRoute = routeClient.use(async ({ next }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return next({ ctx: { currentUser } });
});
