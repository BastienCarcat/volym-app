import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upfetch } from "@/lib/up-fetch";
import z from "zod";
import { produce } from "immer";
import { createSessionFormSchema } from "@/lib/schemas/sessions.form.schema";
import {
  sessionDbSchema,
  setDbSchema,
  sessionWithItemsDbSchema,
} from "@/lib/schemas/sessions.schema";
import type { ProgramWithFullSessions } from "@/app/(root)/programs/_hooks/use-programs";

export type SessionWithItems = z.infer<typeof sessionWithItemsDbSchema>;
export type Session = z.infer<typeof sessionDbSchema>;
export type Set = z.infer<typeof setDbSchema>;

// TODO : put this into an action
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: z.infer<typeof createSessionFormSchema>) => {
      const result = await upfetch(`/api/sessions`, {
        method: "POST",
        schema: z.object({ session: sessionWithItemsDbSchema }),
        body: params,
      });
      return result.session;
    },
    onSuccess: (session, params) => {
      queryClient.setQueryData<SessionWithItems>(
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

  const updateCache = (sessionId: string, data: SessionWithItems) => {
    queryClient.setQueryData(["session", sessionId], data);
  };

  return updateCache;
};
