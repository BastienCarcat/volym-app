import type { UseMutationOptions } from "@tanstack/react-query";

export interface AppError {
  message: string;
  status?: number;
  code?: string;
}

export type MutationOptions<TData, TVariables, TError = AppError> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  "mutationFn"
>;
