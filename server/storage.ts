import { type Lead } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createLead(lead: Lead): Promise<Lead & { id: string }>;
  getLeads(): Promise<(Lead & { id: string })[]>;
}

export class MemStorage implements IStorage {
  private leads: Map<string, Lead & { id: string }>;

  constructor() {
    this.leads = new Map();
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
}

export const storage = new MemStorage();
