import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import z from "zod";
import { programWithScheduleSchema } from "../schemas";

const programListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
});

export type Program = z.infer<typeof programListItemSchema>;
export type ProgramWithSchedule = z.infer<typeof programWithScheduleSchema>;

const fetchPrograms = async () => {
  const result = await upfetch(`/api/programs/`, {
    schema: z.object({
      programs: z.array(programListItemSchema),
    }),
  });
  return result;
};

const fetchProgramWithSchedule = async (programId: string) => {
  const result = await upfetch(`/api/programs/${programId}`, {
    schema: z.object({
      program: z.object({
        id: z.string(),
        name: z.string(),
        note: z.string().nullable(),
        createdBy: z.string(),
        schedules: z.array(
          z.object({
            id: z.string(),
            day: z.string(),
            workoutId: z.string(),
            workout: z.object({
              id: z.string(),
              name: z.string(),
              note: z.string().nullable(),
            }),
          })
        ),
      }),
    }),
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

export const useProgramWithSchedule = (programId: string) => {
  return useQuery({
    queryKey: ["program", programId],
    queryFn: () => fetchProgramWithSchedule(programId),
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

export const useUpdateProgramCache = () => {
  const queryClient = useQueryClient();

  return (programId: string, data: ProgramWithSchedule) => {
    queryClient.setQueryData(["program", programId], data);
  };
};

export const prefetchProgramWithSchedule = async (
  queryClient: QueryClient,
  programId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ["program", programId],
    queryFn: () => fetchProgramWithSchedule(programId),
  });
};
