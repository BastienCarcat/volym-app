import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export interface AppError {
  message: string;
  status?: number;
  code?: string;
}

export type MutationOptions<TData, TVariables, TError = AppError> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  "mutationFn"
>;

export type QueryOptions<TData, TError = AppError> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;
