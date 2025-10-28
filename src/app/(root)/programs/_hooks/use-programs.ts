import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import z from "zod";
import {
  programSchema,
  programWithFullSessionsSchema,
  programWithFullSessionsAndExercisesSchema,
} from "@/lib/schemas/programs";
import { Session, SessionWithExercises } from "@/hooks/use-sessions";
import { queryKeys } from "@/lib/tanstack/query-keys";

export type Program = z.infer<typeof programSchema>;
export type ProgramWithFullSessions = z.infer<
  typeof programWithFullSessionsSchema
>;
export type ProgramWithFullSessionsAndExercises = z.infer<
  typeof programWithFullSessionsAndExercisesSchema
>;

const fetchPrograms = async () => {
  const result = await upfetch(`/api/programs/`, {
    schema: z.object({
      programs: z.array(programSchema),
    }),
  });
  return result;
};

const fetchProgramWithFullSessionsAndExercises = async (programId: string) => {
  const result = await upfetch(`/api/programs/${programId}`, {
    schema: z.object({ program: programWithFullSessionsAndExercisesSchema }),
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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["program", programId],
    queryFn: async () => {
      const data = await fetchProgramWithFullSessionsAndExercises(programId);

      Object.entries(data.exercises).forEach(([exerciseId, exercise]) => {
        queryClient.setQueryData(
          queryKeys.exercises.detail(exerciseId),
          exercise
        );
      });

      const { exercises, ...program } = data;

      return program;
    },
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

export const useUpdateProgramCache = () => {
  const queryClient = useQueryClient();

  const updateCache = (programId: string, data: ProgramWithFullSessions) => {
    queryClient.setQueryData(["program", programId], data);
  };

  const updateSession = (
    programId: string,
    sessionId: string,
    updatedSession: Partial<Session>
  ) => {
    queryClient.setQueryData<ProgramWithFullSessions>(
      ["program", programId],
      (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          const session = draft.sessions.find((s) => s.id === sessionId);
          if (session) {
            Object.assign(session, updatedSession);
          }
        });
      }
    );
  };

  const updateFullSession = (
    programId: string,
    sessionId: string,
    updatedSession: SessionWithExercises
  ) => {
    queryClient.setQueryData<ProgramWithFullSessions>(
      ["program", programId],
      (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          const sessionIndex = draft.sessions.findIndex(
            (s) => s.id === sessionId
          );
          if (sessionIndex !== -1) {
            draft.sessions[sessionIndex] = updatedSession;
          }
        });
      }
    );
  };

  const addSession = (programId: string, newSession: SessionWithExercises) => {
    queryClient.setQueryData<ProgramWithFullSessions>(
      ["program", programId],
      (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          draft.sessions.push(newSession);
        });
      }
    );
  };

  const removeSession = (programId: string, sessionId: string) => {
    queryClient.setQueryData<ProgramWithFullSessions>(
      ["program", programId],
      (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
        });
      }
    );
  };

  return {
    updateCache,
    updateSession,
    updateFullSession,
    addSession,
    removeSession,
  };
};
