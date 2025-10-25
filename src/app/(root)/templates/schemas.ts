import z from "zod";

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
