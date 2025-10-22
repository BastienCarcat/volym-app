import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { programSchema, programWithSessionsSchema } from "../schemas";

export type Program = z.infer<typeof programSchema>;
export type ProgramWithSessions = z.infer<typeof programWithSessionsSchema>;

const fetchPrograms = async () => {
  const result = await upfetch(`/api/programs/`, {
    schema: z.object({
      programs: z.array(programSchema),
    }),
  });
  return result;
};

const fetchProgramWithSessions = async (programId: string) => {
  const result = await upfetch(`/api/programs/${programId}`, {
    schema: z.object({ program: programWithSessionsSchema }),
  });
  return result.program;
};

export const usePrograms = () => {
  const query = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      return fetchPrograms();
    },
  });

  return query;
};

export const useProgram = (programId: string) => {
  return useQuery({
    queryKey: ["program", programId],
    queryFn: () => fetchProgramWithSessions(programId),
    enabled: !!programId,
  });
};

export const useRefreshPrograms = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["programs"] });
  };

  return refresh;
};

export const useRefreshProgram = () => {
  const queryClient = useQueryClient();

  return (programId: string) => {
    void queryClient.invalidateQueries({ queryKey: ["program", programId] });
  };
};
