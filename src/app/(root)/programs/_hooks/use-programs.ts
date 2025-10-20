import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";

const programListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
});

export type Program = z.infer<typeof programListItemSchema>;

const fetchPrograms = async () => {
  const result = await upfetch(`/api/programs/`, {
    schema: z.object({
      programs: z.array(programListItemSchema),
    }),
  });
  return result;
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

export const useRefreshPrograms = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["programs"] });
  };

  return refresh;
};
