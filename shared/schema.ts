import { z } from "zod";

// Lead capture schema for CTA buttons
export const leadSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;
