import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { getCurrentUser } from "../auth/getUser";
import { ApplicationError, SafeActionError } from "../errors";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("SERVER ERROR:", error);

    if (error instanceof SafeActionError) {
      return { message: error.message };
    }

    if (error instanceof ApplicationError) {
      return { message: error.message, type: error.type };
    }

    return { message: DEFAULT_SERVER_ERROR_MESSAGE };
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new SafeActionError("User not found");
  }

  return next({ ctx: { user: currentUser } });
});
