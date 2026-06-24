import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(300, "Message too long (max 300 characters)")
    .regex(/^(?!\s*$).+/, "Message cannot be only spaces")
    .trim(),
});
