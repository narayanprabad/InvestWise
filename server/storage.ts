import { promises as fs } from 'fs';
import type { User, InsertUser, Chat, InsertChat, Goal } from "@shared/schema";

const STORAGE_FILE = './.data/storage.json';

// Ensure storage directory exists
async function ensureStorageDirectory() {
  try {
    await fs.mkdir('./.data', { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
}

// Load data from file
async function loadStorageData() {
  try {
    await ensureStorageDirectory();
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default data structure if file doesn't exist
    return {
      users: {},
      chats: {},
      goals: {},
      currentId: 1
    };
  }
}

// Save data to file
async function saveStorageData(data: any) {
  try {
    await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving storage data:', error);
  }
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<{ [key: number]: User }>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  getUserGoals(userId: number): Promise<Goal[]>;
  setUserGoals(userId: number, goals: Goal[]): Promise<void>;
  getChatHistory(userId: number): Promise<Chat[]>;
  addChatMessage(chat: InsertChat): Promise<Chat>;
}

export class MemStorage implements IStorage {
  private data: {
    users: { [key: number]: User };
    chats: { [key: number]: Chat[] };
    goals: { [key: number]: Goal[] };
    currentId: number;
  };

  constructor() {
    this.data = {
      users: {},
      chats: {},
      goals: {},
      currentId: 1
    };
    this.loadData();
  }

  private async loadData() {
    this.data = await loadStorageData();
  }

  private async saveData() {
    await saveStorageData(this.data);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.data.users[id];
  }
  
  async getAllUsers(): Promise<{ [key: number]: User }> {
    return this.data.users;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.data.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date()
    };
    this.data.users[id] = user;
    this.data.goals[id] = [];
    this.data.chats[id] = [];
    await this.saveData();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const user = this.data.users[id];
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...update };
    this.data.users[id] = updatedUser;
    await this.saveData();
    return updatedUser;
  }

  async getUserGoals(userId: number): Promise<Goal[]> {
    return this.data.goals[userId] || [];
  }

  async setUserGoals(userId: number, goals: Goal[]): Promise<void> {
    this.data.goals[userId] = goals;
    await this.saveData();
  }

  async getChatHistory(userId: number): Promise<Chat[]> {
    return this.data.chats[userId] || [];
  }

  async addChatMessage(chat: InsertChat): Promise<Chat> {
    const id = this.data.currentId++;
    const newChat: Chat = {
      ...chat,
      id,
      createdAt: new Date()
    };

    if (!this.data.chats[chat.userId]) {
      this.data.chats[chat.userId] = [];
    }
    this.data.chats[chat.userId].push(newChat);
    await this.saveData();
    return newChat;
  }
}

export const storage = new MemStorage();