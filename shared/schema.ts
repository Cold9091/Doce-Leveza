import { z } from "zod";

// Lead capture schema for CTA buttons
export const leadSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

// User schema for authentication
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  password: z.string(),
  createdAt: z.string(),
});

export const signupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(9, "Telefone é obrigatório"),
  address: z.string().min(5, "Endereço é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  phone: z.string().min(9, "Telefone é obrigatório"),
  password: z.string().min(6, "Senha é obrigatória"),
});

export type User = z.infer<typeof userSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
