import { 
  type Lead, 
  type User, 
  type SignupData,
  type Pathology,
  type Video,
  type Ebook,
  type Consultation,
  type Subscription,
  type InsertVideo,
  type InsertEbook,
  type InsertConsultation,
  type InsertSubscription
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createLead(lead: Lead): Promise<Lead & { id: string }>;
  getLeads(): Promise<(Lead & { id: string })[]>;
  createUser(data: SignupData): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  
  // Pathologies
  getPathologies(): Promise<Pathology[]>;
  getPathologyBySlug(slug: string): Promise<Pathology | null>;
  
  // Videos
  getVideos(): Promise<Video[]>;
  getVideosByPathology(pathologyId: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | null>;
  createVideo(data: InsertVideo): Promise<Video>;
  
  // Ebooks
  getEbooks(): Promise<Ebook[]>;
  getEbookById(id: number): Promise<Ebook | null>;
  createEbook(data: InsertEbook): Promise<Ebook>;
  
  // Consultations
  getConsultationsByUser(userId: number): Promise<Consultation[]>;
  getConsultationById(id: number): Promise<Consultation | null>;
  createConsultation(data: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null>;
  
  // Subscriptions
  getSubscriptionByUser(userId: number): Promise<Subscription | null>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead & { id: string }>;
  private users: Map<number, User>;
  private pathologies: Map<number, Pathology>;
  private videos: Map<number, Video>;
  private ebooks: Map<number, Ebook>;
  private consultations: Map<number, Consultation>;
  private subscriptions: Map<number, Subscription>;
  private userIdCounter: number;
  private videoIdCounter: number;
  private ebookIdCounter: number;
  private consultationIdCounter: number;
  private subscriptionIdCounter: number;

  constructor() {
    this.leads = new Map();
    this.users = new Map();
    this.pathologies = new Map();
    this.videos = new Map();
    this.ebooks = new Map();
    this.consultations = new Map();
    this.subscriptions = new Map();
    this.userIdCounter = 1;
    this.videoIdCounter = 1;
    this.ebookIdCounter = 1;
    this.consultationIdCounter = 1;
    this.subscriptionIdCounter = 1;
    
    this.seedData();
  }

  async createLead(lead: Lead): Promise<Lead & { id: string }> {
    const id = randomUUID();
    const leadWithId = { ...lead, id };
    this.leads.set(id, leadWithId);
    return leadWithId;
  }

  async getLeads(): Promise<(Lead & { id: string })[]> {
    return Array.from(this.leads.values());
  }

  async createUser(data: SignupData): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      name: data.name,
      phone: data.phone,
      address: data.address,
      password: data.password,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.phone === phone) || null;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Pathologies
  async getPathologies(): Promise<Pathology[]> {
    return Array.from(this.pathologies.values());
  }

  async getPathologyBySlug(slug: string): Promise<Pathology | null> {
    const pathologies = Array.from(this.pathologies.values());
    return pathologies.find(p => p.slug === slug) || null;
  }

  // Videos
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByPathology(pathologyId: number): Promise<Video[]> {
    const videos = Array.from(this.videos.values());
    return videos.filter(v => v.pathologyId === pathologyId);
  }

  async getVideoById(id: number): Promise<Video | null> {
    return this.videos.get(id) || null;
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const video: Video = { id, ...data };
    this.videos.set(id, video);
    return video;
  }

  // Ebooks
  async getEbooks(): Promise<Ebook[]> {
    return Array.from(this.ebooks.values());
  }

  async getEbookById(id: number): Promise<Ebook | null> {
    return this.ebooks.get(id) || null;
  }

  async createEbook(data: InsertEbook): Promise<Ebook> {
    const id = this.ebookIdCounter++;
    const ebook: Ebook = { id, ...data };
    this.ebooks.set(id, ebook);
    return ebook;
  }

  // Consultations
  async getConsultationsByUser(userId: number): Promise<Consultation[]> {
    const consultations = Array.from(this.consultations.values());
    return consultations.filter(c => c.userId === userId);
  }

  async getConsultationById(id: number): Promise<Consultation | null> {
    return this.consultations.get(id) || null;
  }

  async createConsultation(data: InsertConsultation): Promise<Consultation> {
    const id = this.consultationIdCounter++;
    const consultation: Consultation = { id, ...data };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async updateConsultation(id: number, data: Partial<Consultation>): Promise<Consultation | null> {
    const consultation = this.consultations.get(id);
    if (!consultation) return null;
    const updated = { ...consultation, ...data };
    this.consultations.set(id, updated);
    return updated;
  }

  // Subscriptions
  async getSubscriptionByUser(userId: number): Promise<Subscription | null> {
    const subscriptions = Array.from(this.subscriptions.values());
    return subscriptions.find(s => s.userId === userId) || null;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const subscription: Subscription = { id, ...data };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;
    const updated = { ...subscription, ...data };
    this.subscriptions.set(id, updated);
    return updated;
  }

  // Seed data
  private seedData() {
    // Seed pathologies
    const pathologies: Pathology[] = [
      {
        id: 1,
        slug: "diabetes",
        title: "Diabetes",
        description: "Conteúdos especializados para controle e prevenção de diabetes",
        icon: "Activity"
      },
      {
        id: 2,
        slug: "emagrecimento",
        title: "Emagrecimento",
        description: "Programas e orientações para perda de peso saudável",
        icon: "TrendingDown"
      },
      {
        id: 3,
        slug: "hipertensao",
        title: "Hipertensão",
        description: "Guias para controle da pressão arterial",
        icon: "HeartPulse"
      },
      {
        id: 4,
        slug: "gestantes",
        title: "Gestantes",
        description: "Nutrição adequada para gestantes e bebês",
        icon: "Baby"
      }
    ];

    pathologies.forEach(p => this.pathologies.set(p.id, p));

    // Seed videos
    const videos: Video[] = [
      {
        id: 1,
        pathologyId: 1,
        title: "Introdução ao Controle de Diabetes",
        description: "Aprenda os fundamentos para controlar a diabetes através da alimentação",
        duration: "15:30",
        thumbnailUrl: "https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=400",
        videoUrl: "#",
        resources: ["PDF: Tabela de Alimentos", "Receitas Diabéticos"]
      },
      {
        id: 2,
        pathologyId: 1,
        title: "Alimentos que Controlam o Açúcar",
        description: "Descubra quais alimentos ajudam a manter o açúcar estável",
        duration: "12:45",
        thumbnailUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
        videoUrl: "#"
      },
      {
        id: 3,
        pathologyId: 2,
        title: "Estratégias para Emagrecimento Saudável",
        description: "Métodos comprovados para perder peso de forma sustentável",
        duration: "18:20",
        thumbnailUrl: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=400",
        videoUrl: "#"
      },
      {
        id: 4,
        pathologyId: 3,
        title: "Controlando a Pressão Arterial",
        description: "Dieta DASH e outras estratégias nutricionais",
        duration: "14:15",
        thumbnailUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400",
        videoUrl: "#"
      },
      {
        id: 5,
        pathologyId: 4,
        title: "Nutrição na Gestação",
        description: "Tudo que você precisa saber sobre alimentação durante a gravidez",
        duration: "20:10",
        thumbnailUrl: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=400",
        videoUrl: "#"
      }
    ];

    videos.forEach(v => {
      this.videos.set(v.id, v);
      this.videoIdCounter = Math.max(this.videoIdCounter, v.id + 1);
    });

    // Seed ebooks
    const ebooks: Ebook[] = [
      {
        id: 1,
        title: "Guia Completo de Nutrição para Diabetes",
        description: "Manual abrangente com receitas e orientações práticas",
        coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
        downloadUrl: "#",
        tags: ["diabetes", "receitas", "guia"],
        pages: 120
      },
      {
        id: 2,
        title: "30 Dias de Emagrecimento Saudável",
        description: "Plano alimentar completo para 30 dias",
        coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        downloadUrl: "#",
        tags: ["emagrecimento", "plano alimentar"],
        pages: 85
      },
      {
        id: 3,
        title: "Receitas Low Carb",
        description: "50 receitas deliciosas com baixo carboidrato",
        coverUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400",
        downloadUrl: "#",
        tags: ["receitas", "low carb", "emagrecimento"],
        pages: 95
      }
    ];

    ebooks.forEach(e => {
      this.ebooks.set(e.id, e);
      this.ebookIdCounter = Math.max(this.ebookIdCounter, e.id + 1);
    });
  }
}

export const storage = new MemStorage();
