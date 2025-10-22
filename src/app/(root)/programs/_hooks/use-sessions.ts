import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { upfetch } from "@/lib/up-fetch";
import z from "zod";
import { produce } from "immer";
import { createSessionSchema, sessionWithExercisesSchema } from "../schemas";
import type { ProgramWithSessions } from "./use-programs";

export type SessionWithExercises = z.infer<typeof sessionWithExercisesSchema>;

const fetchSession = async (
  sessionId: string
): Promise<SessionWithExercises> => {
  const result = await upfetch(`/api/sessions/${sessionId}`, {
    schema: z.object({ session: sessionWithExercisesSchema }),
  });
  return result.session;
};

export const useSession = (sessionId: string) => {
  return useQuery<SessionWithExercises>({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSession(sessionId),
    enabled: !!sessionId,
  });
};

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

      queryClient.setQueryData<ProgramWithSessions>(
        ["program", params.programId],
        (old) => {
          if (!old) return old;

          return produce(old, (draft) => {
            draft.sessions.push({
              id: session.id,
              name: session.name,
              note: session.note,
              day: session.day,
              weekNumber: session.weekNumber,
              templateId: session.templateId,
            });
          });
        }
      );

      return session;
    },
  });
};
