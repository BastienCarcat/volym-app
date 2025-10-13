import {
  useMutation,
  useQueryClient,
  MutationFunction,
} from "@tanstack/react-query";

type OptimisticMutationParams<
  TCacheData, // ce qui est dans le cache
  TVariables, // ce que tu passes à mutate()
  TMutationResult // ce que retourne ton mutationFn
> = {
  mutationFn: MutationFunction<TMutationResult, TVariables>;
  queryKey: string[];
  getOptimisticUpdate: (
    oldData: TCacheData | undefined,
    variables: TVariables
  ) =>
    | { newData: TCacheData | undefined; context?: Record<string, any> }
    | undefined;
  getSuccessUpdate?: (
    oldData: TCacheData | undefined,
    mutationResult: TMutationResult,
    variables: TVariables,
    context?: Record<string, any>
  ) => TCacheData | undefined;
};

export function useOptimisticMutation<TCacheData, TVariables, TMutationResult>(
  params: OptimisticMutationParams<TCacheData, TVariables, TMutationResult>
) {
  const queryClient = useQueryClient();

  const { mutationFn, queryKey, getOptimisticUpdate, getSuccessUpdate } =
    params;

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<TCacheData>(queryKey);

      const result = getOptimisticUpdate(previousData, variables);
      if (!result) return { previousData };
      const { newData, context } = result;

      if (newData) queryClient.setQueryData(queryKey, newData);
      return { previousData, ...context };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData)
        queryClient.setQueryData(queryKey, context.previousData);
    },
    onSuccess: (mutationResult, variables, _context) => {
      if (!getSuccessUpdate) return;
      const currentData = queryClient.getQueryData<TCacheData>(queryKey);
      const newData = getSuccessUpdate(
        currentData,
        mutationResult,
        variables,
        _context
      );
      console.log("_context :>> ", _context);
      if (newData) queryClient.setQueryData(queryKey, newData);
    },
  });
}
