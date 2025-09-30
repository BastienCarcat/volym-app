import { clsx, type ClassValue } from "clsx";
import { SafeActionResult } from "next-safe-action";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines if a server action is successful or not
 * A server action is successful if it has a data property and no serverError property
 *
 * @param action Return value of a server action
 * @returns A boolean indicating if the action is successful
 */
export const isActionSuccessful = <T>(
  action?: SafeActionResult<string, any, any, any, any>
): action is {
  data: T;
  serverError: undefined;
  validationErrors: undefined;
} => {
  if (!action) {
    return false;
  }

  if (action.serverError) {
    return false;
  }

  if (action.validationErrors) {
    return false;
  }

  return true;
};

/**
 * Converts an action result to a promise that resolves with the data or rejects with error
 *
 * @param action Return value of a server action
 * @returns A promise that resolves with the action data
 */
export const resolveActionResult = async <T>(
  action: Promise<SafeActionResult<string, any, any, any, any> | undefined>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    action
      .then((result) => {
        if (isActionSuccessful<T>(result)) {
          resolve(result.data);
        } else {
          reject(result?.serverError ?? "Something went wrong");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
