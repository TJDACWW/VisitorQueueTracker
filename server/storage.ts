import { groups, settings, type Group, type InsertGroup, type Settings, type InsertSettings } from "@shared/schema";

export interface IStorage {
  // Groups
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  getQueuedGroups(): Promise<Group[]>;
  getInProgressGroups(): Promise<Group[]>;
  
  // Settings
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(key: string, value: string): Promise<Settings>;
  getSettings(): Promise<Settings[]>;
}

export class MemStorage implements IStorage {
  private groups: Map<number, Group>;
  private settings: Map<string, Settings>;
  private currentGroupId: number;
  private currentSettingsId: number;

  constructor() {
    this.groups = new Map();
    this.settings = new Map();
    this.currentGroupId = 1;
    this.currentSettingsId = 1;
    
    // Initialize default settings
    this.initializeDefaultSettings();
  }

  private async initializeDefaultSettings() {
    await this.setSetting("concurrentGroups", "2");
    await this.setSetting("activityDuration", "10");
    await this.setSetting("isBreakTime", "false");
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).sort((a, b) => a.queuePosition - b.queuePosition);
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.currentGroupId++;
    const queuePosition = await this.getNextQueuePosition();
    const group: Group = {
      id,
      contactName: insertGroup.contactName,
      members: insertGroup.members,
      size: insertGroup.size,
      status: insertGroup.status || "waiting",
      assignedStaff: insertGroup.assignedStaff || null,
      notes: insertGroup.notes || null,
      present: insertGroup.present !== undefined ? insertGroup.present : true,
      registrationTime: new Date(),
      startTime: insertGroup.startTime || null,
      endTime: insertGroup.endTime || null,
      queuePosition,
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  async getQueuedGroups(): Promise<Group[]> {
    return Array.from(this.groups.values())
      .filter(group => group.status === "waiting")
      .sort((a, b) => a.queuePosition - b.queuePosition);
  }

  async getInProgressGroups(): Promise<Group[]> {
    return Array.from(this.groups.values())
      .filter(group => group.status === "in-progress")
      .sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0));
  }

  private async getNextQueuePosition(): Promise<number> {
    const groups = Array.from(this.groups.values());
    if (groups.length === 0) return 1;
    return Math.max(...groups.map(g => g.queuePosition)) + 1;
  }

  // Settings
  async getSetting(key: string): Promise<Settings | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const existing = this.settings.get(key);
    if (existing) {
      const updated = { ...existing, value };
      this.settings.set(key, updated);
      return updated;
    } else {
      const id = this.currentSettingsId++;
      const setting: Settings = { id, key, value };
      this.settings.set(key, setting);
      return setting;
    }
  }

  async getSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values());
  }
}

export const storage = new MemStorage();
