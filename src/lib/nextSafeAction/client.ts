import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { getCurrentUser } from "../auth/getUser";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("SERVER ERROR:", error);

    if (error instanceof ActionError) {
      return error.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new ActionError("User not found");
  }

  return next({ ctx: { user: currentUser } });
});
