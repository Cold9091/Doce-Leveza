import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  password: text("password").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const pathologies = sqliteTable("pathologies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
  price: integer("price").default(0),
});

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pathologyId: integer("pathology_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  resources: text("resources"), // JSON string
  viewCount: integer("view_count").default(0),
});

export const ebooks = sqliteTable("ebooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pathologyId: integer("pathology_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url").notNull(),
  downloadUrl: text("download_url").notNull(),
  tags: text("tags").notNull(), // JSON string
  pages: integer("pages").notNull(),
});

export const consultations = sqliteTable("consultations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  datetime: text("datetime").notNull(),
  status: text("status").notNull(), // "agendada", "concluida", "cancelada"
  notes: text("notes").notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  plan: text("plan").notNull(), // "mensal", "anual"
  status: text("status").notNull(), // "ativa", "cancelada", "expirada"
  startDate: text("start_date").notNull(),
  renewalDate: text("renewal_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  proofUrl: text("proof_url"),
});

export const userAccess = sqliteTable("user_access", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  pathologyId: integer("pathology_id").notNull(),
  startDate: text("start_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: text("status").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: integer("read").default(0), // 0 = false, 1 = true
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const adminNotifications = sqliteTable("admin_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  relatedId: integer("related_id"),
  read: integer("read").default(0),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteName: text("site_name").default("Doce Leveza"),
  supportEmail: text("support_email").default("suporte@doceleveza.com"),
  supportPhone: text("support_phone").default("(11) 99999-9999"),
  maintenanceMode: integer("maintenance_mode").default(0),
  enableSignup: integer("enable_signup").default(1),
  apiBaseUrl: text("api_base_url"),
  googleAnalyticsId: text("google_analytics_id"),
  facebookPixelId: text("facebook_pixel_id"),
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
});

// Schemas for Zod (Application Level Validation)

// Lead capture schema for CTA buttons
export const leadSchema = createInsertSchema(leads).pick({
  name: true,
  email: true,
  phone: true,
}).extend({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export const videoSchema = createInsertSchema(videos).extend({
  resources: z.array(z.string()).optional(),
});

export const ebookSchema = createInsertSchema(ebooks).extend({
  tags: z.array(z.string()),
});

export const signupSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  address: true,
  password: true,
}).extend({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(9, "Telefone é obrigatório"),
  address: z.string().min(5, "Endereço é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  phone: z.string().min(9, "Telefone é obrigatório"),
  password: z.string().min(6, "Senha é obrigatória"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha é obrigatória"),
});

// Export types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SignupData = z.infer<typeof signupSchema>;

export type AdminUser = typeof admins.$inferSelect;
export type InsertAdminUser = typeof admins.$inferInsert;

export type Pathology = typeof pathologies.$inferSelect;
export type InsertPathology = typeof pathologies.$inferInsert;

export type Video = Omit<typeof videos.$inferSelect, "resources"> & { resources?: string[] };
export type InsertVideo = Omit<typeof videos.$inferInsert, "resources"> & { resources?: string[] };

export type Ebook = Omit<typeof ebooks.$inferSelect, "tags"> & { tags: string[] };
export type InsertEbook = Omit<typeof ebooks.$inferInsert, "tags"> & { tags: string[] };

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true });
export const consultationSchema = createInsertSchema(consultations);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true });
export const subscriptionSchema = createInsertSchema(subscriptions);


export type UserAccess = typeof userAccess.$inferSelect;
export type InsertUserAccess = typeof userAccess.$inferInsert;
export const insertUserAccessSchema = createInsertSchema(userAccess).omit({ id: true });
export const userAccessSchema = createInsertSchema(userAccess);


export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const notificationSchema = createInsertSchema(notifications);


export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;
export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({ id: true });
export const adminNotificationSchema = createInsertSchema(adminNotifications);


export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true });
export const systemSettingsSchema = createInsertSchema(systemSettings);


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

// Additional Schema Exports for frontend compatibility
export const insertPathologySchema = createInsertSchema(pathologies).omit({ id: true });
export const pathologySchema = createInsertSchema(pathologies);

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true }).extend({
  resources: z.array(z.string()).optional(),
});
export const insertEbookSchema = createInsertSchema(ebooks).omit({ id: true }).extend({
  tags: z.array(z.string()),
});
export const userSchema = createInsertSchema(users);
export const adminUserSchema = createInsertSchema(admins);


