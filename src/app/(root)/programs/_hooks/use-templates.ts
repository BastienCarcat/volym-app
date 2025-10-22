import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { templateSchema } from "../schemas";

export type Template = z.infer<typeof templateSchema>;

const fetchTemplates = async () => {
  const result = await upfetch(`/api/templates/`, {
    schema: z.object({
      templates: z.array(templateSchema),
    }),
  });
  return result.templates;
};

export const useTemplates = () => {
  const query = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  return query;
};
