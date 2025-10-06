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

/**
 * Format raw digits string to MM:SS display format for duration input
 * @param rawDigits string of digits (1-4 characters)
 * @returns formatted display string (e.g., "245" -> "2:45")
 */
export const formatDigitsToTimeDisplay = (rawDigits: string): string => {
  if (rawDigits.length === 0) return "";
  if (rawDigits.length === 1) return `0:0${rawDigits}`;
  if (rawDigits.length === 2) return `0:${rawDigits}`;
  if (rawDigits.length === 3) return `${rawDigits[0]}:${rawDigits.slice(1)}`;
  if (rawDigits.length === 4)
    return `${rawDigits.slice(0, 2)}:${rawDigits.slice(2)}`;
  return rawDigits;
};

/**
 * Parse raw digits string to total seconds for duration input
 * @param rawDigits string of digits (1-4 characters)
 * @returns total seconds with validation (max 99:59) (e.g., "130" -> "90 sec")
 */
export const parseDigitsToSeconds = (rawDigits: string): number => {
  if (rawDigits.length === 0) return 0;

  let minutes = 0;
  let seconds = 0;

  if (rawDigits.length === 1) {
    seconds = parseInt(rawDigits);
  } else if (rawDigits.length === 2) {
    seconds = parseInt(rawDigits);
  } else if (rawDigits.length === 3) {
    minutes = parseInt(rawDigits[0]);
    seconds = parseInt(rawDigits.slice(1));
  } else if (rawDigits.length === 4) {
    minutes = parseInt(rawDigits.slice(0, 2));
    seconds = parseInt(rawDigits.slice(2));
  }

  // Validate limits
  if (seconds > 59) seconds = 59;
  if (minutes > 99) minutes = 99;

  return minutes * 60 + seconds;
};

/**
 * Convert total seconds back to digits string for duration input state
 * @param totalSeconds total seconds
 * @returns digits string as if user typed it (e.g., 90 sec -> "130" for 1:30)
 */
export const secondsToDigitsString = (totalSeconds: number): string => {
  if (totalSeconds === 0) return "";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Reconstruct as if user typed it
  const minutesStr = minutes.toString();
  const secondsStr = seconds.toString().padStart(2, "0");

  // Remove leading zeros to match input logic
  const combined = minutesStr + secondsStr;
  return combined.replace(/^0+/, "") || "0";
};
