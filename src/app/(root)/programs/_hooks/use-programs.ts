import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import z from "zod";
import {
  programSchema,
  programWithSessionsSchema,
  sessionSchema,
} from "../schemas";
import { Session } from "./use-sessions";

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

export const useUpdateProgramCache = () => {
  const queryClient = useQueryClient();

  const updateCache = (programId: string, data: ProgramWithSessions) => {
    queryClient.setQueryData(["program", programId], data);
  };

  const updateSession = (
    programId: string,
    sessionId: string,
    updatedSession: Partial<Session>
  ) => {
    queryClient.setQueryData<ProgramWithSessions>(
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

  const addSession = (programId: string, newSession: Session) => {
    queryClient.setQueryData<ProgramWithSessions>(
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
    queryClient.setQueryData<ProgramWithSessions>(
      ["program", programId],
      (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          draft.sessions = draft.sessions.filter((s) => s.id !== sessionId);
        });
      }
    );
  };

  return { updateCache, updateSession, addSession, removeSession };
};
