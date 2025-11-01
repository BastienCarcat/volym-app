import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { templateSchema } from "../schemas";
import { produce } from "immer";

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

export const useRefreshTemplates = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["templates"] });
  };

  return refresh;
};

export const useUpdateTemplatesCache = () => {
  const queryClient = useQueryClient();

  // TODO: remove this and use refresh
  const addTemplate = (newTemplate: Template) => {
    queryClient.setQueryData<Template[]>(["templates"], (oldData) => {
      if (!oldData) return oldData;

      return produce(oldData, (draft) => {
        draft.push(newTemplate);
      });
    });
  };

  const removeTemplate = (templateId: string) => {
    queryClient.setQueryData<Template[]>(["templates"], (oldData) => {
      if (!oldData) return oldData;

      return produce(oldData, (draft) => {
        const index = draft.findIndex((t) => t.id === templateId);
        if (index !== -1) {
          draft.splice(index, 1);
        }
      });
    });
  };

  return { removeTemplate, addTemplate };
};
