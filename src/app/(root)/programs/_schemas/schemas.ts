import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
