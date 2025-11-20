import { type Lead, type User, type SignupData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createLead(lead: Lead): Promise<Lead & { id: string }>;
  getLeads(): Promise<(Lead & { id: string })[]>;
  createUser(data: SignupData): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead & { id: string }>;
  private users: Map<number, User>;
  private userIdCounter: number;

  constructor() {
    this.leads = new Map();
    this.users = new Map();
    this.userIdCounter = 1;
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
}

export const storage = new MemStorage();
