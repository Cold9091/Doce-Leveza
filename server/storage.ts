import {
  type Lead,
  type InsertLead,
  type User,
  type InsertUser,
  type SignupData,
  type Pathology,
  type InsertPathology,
  type Video,
  type Ebook,
  type Consultation,
  type Subscription,
  type UserAccess,
  type InsertVideo,
  type InsertEbook,
  type InsertConsultation,
  type InsertSubscription,
  type AdminUser,
  type Statistics,
  type SystemSettings,
  type AdminNotification,
  type InsertAdminNotification,
  type Notification,
  type InsertNotification,
  users, videos, ebooks, consultations, subscriptions, userAccess, leads, admins, notifications, adminNotifications, systemSettings,
  pathologies
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  deleteLead(id: number): Promise<boolean>;

  // Users
  createUser(data: SignupData): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  updateUser(id: number, data: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Pathologies/Programs
  getPathologies(): Promise<Pathology[]>;
  getPathologyById(id: number): Promise<Pathology | null>;
  getPathologyBySlug(slug: string): Promise<Pathology | null>;
  createPathology(data: InsertPathology): Promise<Pathology>;
  updatePathology(id: number, data: Partial<Pathology>): Promise<Pathology | null>;
  deletePathology(id: number): Promise<boolean>;

  // Videos
  getVideos(): Promise<Video[]>;
  getVideosByPathology(pathologyId: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | null>;
  createVideo(data: InsertVideo): Promise<Video>;
  updateVideo(id: number, data: Partial<Video>): Promise<Video | null>;
  deleteVideo(id: number): Promise<boolean>;

  // Ebooks
  getEbooks(): Promise<Ebook[]>;
  getEbooksByPathology(pathologyId: number): Promise<Ebook[]>;
  getEbookById(id: number): Promise<Ebook | null>;
  createEbook(data: InsertEbook): Promise<Ebook>;
  updateEbook(id: number, data: Partial<Ebook>): Promise<Ebook | null>;
  deleteEbook(id: number): Promise<boolean>;

  // Consultations
  getConsultations(): Promise<Consultation[]>;
  getConsultationsByUser(userId: number): Promise<Consultation[]>;
  getConsultationById(id: number): Promise<Consultation | null>;
  createConsultation(data: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null>;
  deleteConsultation(id: number): Promise<boolean>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscriptionByUser(userId: number): Promise<Subscription | null>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null>;
  deleteSubscription(id: number): Promise<boolean>;

  // User Access
  getUserAccess(userId: number): Promise<UserAccess[]>;
  createUserAccess(data: any): Promise<UserAccess>;
  updateUserAccess(id: number, data: any): Promise<UserAccess | null>;

  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;

  // Admin
  getAdminById(id: number): Promise<AdminUser | null>;
  getAdminByEmail(email: string): Promise<AdminUser | null>;
  getStatistics(): Promise<Statistics>;

  // Admin Notifications
  getAdminNotifications(): Promise<AdminNotification[]>;
  createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification>;
  markAdminNotificationRead(id: number): Promise<boolean>;

  // Settings
  getSettings(): Promise<SystemSettings>;
  updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  // Leads
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async deleteLead(id: number): Promise<boolean> {
    const [deleted] = await db.delete(leads).where(eq(leads.id, id)).returning();
    return !!deleted;
  }

  // Users
  async createUser(data: SignupData): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | null> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!deleted;
  }

  // Pathologies
  async getPathologies(): Promise<Pathology[]> {
    return await db.select().from(pathologies);
  }

  async getPathologyById(id: number): Promise<Pathology | null> {
    const [pathology] = await db.select().from(pathologies).where(eq(pathologies.id, id));
    return pathology || null;
  }

  async getPathologyBySlug(slug: string): Promise<Pathology | null> {
    const [pathology] = await db.select().from(pathologies).where(eq(pathologies.slug, slug));
    return pathology || null;
  }

  async createPathology(data: InsertPathology): Promise<Pathology> {
    const [pathology] = await db.insert(pathologies).values(data).returning();
    return pathology;
  }

  async updatePathology(id: number, data: Partial<Pathology>): Promise<Pathology | null> {
    const [pathology] = await db.update(pathologies).set(data).where(eq(pathologies.id, id)).returning();
    return pathology || null;
  }

  async deletePathology(id: number): Promise<boolean> {
    const [deleted] = await db.delete(pathologies).where(eq(pathologies.id, id)).returning();
    return !!deleted;
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    const result = await db.select().from(videos);
    return result.map(v => ({
      ...v,
      resources: v.resources ? JSON.parse(v.resources) : undefined
    }));
  }

  async getVideosByPathology(pathologyId: number): Promise<Video[]> {
    const result = await db.select().from(videos).where(eq(videos.pathologyId, pathologyId));
    return result.map(v => ({
      ...v,
      resources: v.resources ? JSON.parse(v.resources) : undefined
    }));
  }

  async getVideoById(id: number): Promise<Video | null> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return null;
    return {
      ...video,
      resources: video.resources ? JSON.parse(video.resources) : undefined
    };
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const { resources, ...videoData } = data;
    const [video] = await db.insert(videos).values({
      ...videoData,
      resources: resources ? JSON.stringify(resources) : undefined
    }).returning();
    return {
      ...video,
      resources: video.resources ? JSON.parse(video.resources) : undefined
    };
  }

  async updateVideo(id: number, data: Partial<Video>): Promise<Video | null> {
    const { resources, ...videoData } = data;
    const [video] = await db.update(videos).set({
      ...videoData,
      resources: resources ? JSON.stringify(resources) : undefined
    }).where(eq(videos.id, id)).returning();

    if (!video) return null;
    return {
      ...video,
      resources: video.resources ? JSON.parse(video.resources) : undefined
    };
  }

  async deleteVideo(id: number): Promise<boolean> {
    const [deleted] = await db.delete(videos).where(eq(videos.id, id)).returning();
    return !!deleted;
  }

  // Ebooks
  async getEbooks(): Promise<Ebook[]> {
    const result = await db.select().from(ebooks);
    return result.map(e => ({
      ...e,
      tags: JSON.parse(e.tags)
    }));
  }

  async getEbooksByPathology(pathologyId: number): Promise<Ebook[]> {
    const result = await db.select().from(ebooks).where(eq(ebooks.pathologyId, pathologyId));
    return result.map(e => ({
      ...e,
      tags: JSON.parse(e.tags)
    }));
  }

  async getEbookById(id: number): Promise<Ebook | null> {
    const [ebook] = await db.select().from(ebooks).where(eq(ebooks.id, id));
    if (!ebook) return null;
    return {
      ...ebook,
      tags: JSON.parse(ebook.tags)
    };
  }

  async createEbook(data: InsertEbook): Promise<Ebook> {
    const { tags, ...ebookData } = data;
    const [ebook] = await db.insert(ebooks).values({
      ...ebookData,
      tags: JSON.stringify(tags)
    }).returning();
    return {
      ...ebook,
      tags: JSON.parse(ebook.tags)
    };
  }

  async updateEbook(id: number, data: Partial<Ebook>): Promise<Ebook | null> {
    const { tags, ...ebookData } = data;
    const [ebook] = await db.update(ebooks).set({
      ...ebookData,
      tags: tags ? JSON.stringify(tags) : undefined
    }).where(eq(ebooks.id, id)).returning();

    if (!ebook) return null;
    return {
      ...ebook,
      tags: JSON.parse(ebook.tags)
    };
  }

  async deleteEbook(id: number): Promise<boolean> {
    const [deleted] = await db.delete(ebooks).where(eq(ebooks.id, id)).returning();
    return !!deleted;
  }

  // Consultations
  async getConsultations(): Promise<Consultation[]> {
    return await db.select().from(consultations);
  }

  async getConsultationsByUser(userId: number): Promise<Consultation[]> {
    return await db.select().from(consultations).where(eq(consultations.userId, userId));
  }

  async getConsultationById(id: number): Promise<Consultation | null> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation || null;
  }

  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db.insert(consultations).values({
      ...data,
      status: data.status || "agendada"
    }).returning();
    return consultation;
  }

  async updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null> {
    const [consultation] = await db.update(consultations).set(data).where(eq(consultations.id, id)).returning();
    return consultation || null;
  }

  async deleteConsultation(id: number): Promise<boolean> {
    const [deleted] = await db.delete(consultations).where(eq(consultations.id, id)).returning();
    return !!deleted;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async getSubscriptionByUser(userId: number): Promise<Subscription | null> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription || null;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(data).returning();
    return subscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null> {
    const [subscription] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return subscription || null;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    const [deleted] = await db.delete(subscriptions).where(eq(subscriptions.id, id)).returning();
    return !!deleted;
  }

  // User Access
  async getUserAccess(userId: number): Promise<UserAccess[]> {
    return await db.select().from(userAccess).where(eq(userAccess.userId, userId));
  }

  async createUserAccess(data: any): Promise<UserAccess> {
    const [access] = await db.insert(userAccess).values(data).returning();
    return access;
  }

  async updateUserAccess(id: number, data: any): Promise<UserAccess | null> {
    const [access] = await db.update(userAccess).set(data).where(eq(userAccess.id, id)).returning();
    return access || null;
  }

  // Notifications
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const [notification] = await db.update(notifications).set({ read: 1 }).where(eq(notifications.id, id)).returning();
    return !!notification;
  }

  // Admin
  async getAdminById(id: number): Promise<AdminUser | null> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || null;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || null;
  }

  async getStatistics(): Promise<Statistics> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [videoCount] = await db.select({ count: sql<number>`count(*)` }).from(videos);
    const [ebookCount] = await db.select({ count: sql<number>`count(*)` }).from(ebooks);
    const [consultationCount] = await db.select({ count: sql<number>`count(*)` }).from(consultations);
    const [leadCount] = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const [activeSubCount] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "ativa"));

    // Recent users (last 30 days) - SQLite specific date calculation
    const [recentUserCount] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at >= date('now', '-30 days')`);

    return {
      totalUsers: userCount?.count || 0,
      activeSubscriptions: activeSubCount?.count || 0,
      totalVideos: videoCount?.count || 0,
      totalEbooks: ebookCount?.count || 0,
      totalConsultations: consultationCount?.count || 0,
      totalLeads: leadCount?.count || 0,
      recentUsers: recentUserCount?.count || 0
    };
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    return await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt));
  }

  async createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification> {
    const [notification] = await db.insert(adminNotifications).values(data).returning();
    return notification;
  }

  async markAdminNotificationRead(id: number): Promise<boolean> {
    const [notification] = await db.update(adminNotifications).set({ read: 1 }).where(eq(adminNotifications.id, id)).returning();
    return !!notification;
  }

  // Settings
  async getSettings(): Promise<SystemSettings> {
    // Try to get settings, if not exists, create one
    let [settings] = await db.select().from(systemSettings).limit(1);

    if (!settings) {
      [settings] = await db.insert(systemSettings).values({
        siteName: "Doce Leveza",
        supportEmail: "suporte@doceleveza.com",
        supportPhone: "(11) 99999-9999",
        maintenanceMode: 0,
        enableSignup: 1
      }).returning();
    }

    return settings;
  }

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    let [settings] = await db.select().from(systemSettings).limit(1);

    if (!settings) {
      // Should not happen if getSettings is called first, but just in case
      return this.getSettings();
    }

    [settings] = await db.update(systemSettings).set(data).where(eq(systemSettings.id, settings.id)).returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
