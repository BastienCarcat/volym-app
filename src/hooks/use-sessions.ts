import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upfetch } from "@/lib/up-fetch";
import z from "zod";
import { produce } from "immer";
import {
  createSessionSchema,
  sessionSchema,
  sessionSetSchema,
  sessionWithExercisesSchema,
} from "@/lib/schemas/sessions";
import type { ProgramWithFullSessions } from "@/app/(root)/programs/_hooks/use-programs";

export type SessionWithExercises = z.infer<typeof sessionWithExercisesSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionSet = z.infer<typeof sessionSetSchema>;

// TODO : put this into an action
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createSessionSchema>) => {
      const result = await upfetch(`/api/sessions`, {
        method: "POST",
        schema: z.object({ session: sessionWithExercisesSchema }),
        body: params,
      });
      return result.session;
    },
    onSuccess: (session, params) => {
      queryClient.setQueryData<SessionWithExercises>(
        ["session", session.id],
        session
      );

      queryClient.setQueryData<ProgramWithFullSessions>(
        ["program", params.programId],
        (old) => {
          if (!old) return old;

          return produce(old, (draft) => {
            draft.sessions.push(session);
          });
        }
      );

      return session;
    },
  });
};

export const useUpdateSessionCache = () => {
  const queryClient = useQueryClient();

  const updateCache = (sessionId: string, data: SessionWithExercises) => {
    queryClient.setQueryData(["session", sessionId], data);
  };

  return updateCache;
};
