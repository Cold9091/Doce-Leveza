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
  price: z.number().default(0), // Preço individual do programa
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
  pathologyId: z.number().optional(), // Conecta ebook a uma patologia/programa
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
  datetime: z.string(),
  status: z.enum(["agendada", "concluida", "cancelada"]),
  notes: z.string().min(5, "A descrição (motivo) da consulta é obrigatória"),
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
  proofUrl: z.string().optional(),
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

// User Access to Pathologies/Programs
export const userAccessSchema = z.object({
  id: z.number(),
  userId: z.number(),
  pathologyId: z.number(),
  startDate: z.string(),
  expiryDate: z.string(),
  status: z.enum(["activo", "expirado", "removido", "pendente", "inativo"]),
});

export const insertUserAccessSchema = userAccessSchema.omit({ id: true });
export type UserAccess = z.infer<typeof userAccessSchema>;
export type InsertUserAccess = z.infer<typeof insertUserAccessSchema>;

// System Settings schema
export const systemSettingsSchema = z.object({
  id: z.number(),
  siteName: z.string().default("Doce Leveza"),
  supportEmail: z.string().email().default("suporte@doceleveza.com"),
  supportPhone: z.string().default("(11) 99999-9999"),
  maintenanceMode: z.boolean().default(false),
  enableSignup: z.boolean().default(true),
  // Advanced Settings
  apiBaseUrl: z.string().url().optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
});

export const insertSystemSettingsSchema = systemSettingsSchema.omit({ id: true });
export type SystemSettings = z.infer<typeof systemSettingsSchema>;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

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

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["consultation", "content", "system", "payment"]),
  read: z.boolean().default(false),
  createdAt: z.string(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true });
export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Admin Notification schema
export const adminNotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["payment", "renewal", "system"]),
  relatedId: z.number().optional(), // ID da assinatura ou acesso relacionado
  read: z.boolean().default(false),
  createdAt: z.string(),
});

export const insertAdminNotificationSchema = adminNotificationSchema.omit({ id: true });
export type AdminNotification = z.infer<typeof adminNotificationSchema>;
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
