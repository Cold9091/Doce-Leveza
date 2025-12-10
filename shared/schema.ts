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

// Pathology schema
export const pathologySchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  imageUrl: z.string().optional(),
});

export const insertPathologySchema = pathologySchema.omit({ id: true });
export type Pathology = z.infer<typeof pathologySchema>;
export type InsertPathology = z.infer<typeof insertPathologySchema>;

// Video schema
export const videoSchema = z.object({
  id: z.number(),
  pathologyId: z.number(),
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  thumbnailUrl: z.string(),
  videoUrl: z.string(),
  resources: z.array(z.string()).optional(),
  viewCount: z.number().optional(),
});

export const insertVideoSchema = videoSchema.omit({ id: true });
export type Video = z.infer<typeof videoSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Ebook schema
export const ebookSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  coverUrl: z.string(),
  downloadUrl: z.string(),
  tags: z.array(z.string()),
  pages: z.number(),
});

export const insertEbookSchema = ebookSchema.omit({ id: true });
export type Ebook = z.infer<typeof ebookSchema>;
export type InsertEbook = z.infer<typeof insertEbookSchema>;

// Consultation schema
export const consultationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  professionalName: z.string(),
  professionalSpecialty: z.string(),
  datetime: z.string(),
  status: z.enum(["agendada", "concluida", "cancelada"]),
  notes: z.string().optional(),
});

export const insertConsultationSchema = consultationSchema.omit({ id: true });
export type Consultation = z.infer<typeof consultationSchema>;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  plan: z.enum(["mensal", "anual"]),
  status: z.enum(["ativa", "cancelada", "expirada"]),
  startDate: z.string(),
  renewalDate: z.string(),
  paymentMethod: z.string(),
});

export const insertSubscriptionSchema = subscriptionSchema.omit({ id: true });
export type Subscription = z.infer<typeof subscriptionSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Admin user schema
export const adminUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin", "super_admin"]),
  createdAt: z.string(),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha é obrigatória"),
});

export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;

// Statistics schema for admin dashboard
export const statisticsSchema = z.object({
  totalUsers: z.number(),
  activeSubscriptions: z.number(),
  totalVideos: z.number(),
  totalEbooks: z.number(),
  totalConsultations: z.number(),
  totalLeads: z.number(),
  recentUsers: z.number(),
  revenue: z.number().optional(),
});

export type Statistics = z.infer<typeof statisticsSchema>;
