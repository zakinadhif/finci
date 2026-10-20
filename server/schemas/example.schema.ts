import { z } from "zod";

// Example schema — replace with your actual fields
export const exampleSchema = z.object({
  message: z.string().min(1, "Message is required").max(500),
});
