import type { Chat, Message, CurrentUserProfile } from '../types/index.ts';

const DB_NAME = 'TelegramCloneDB';
const DB_VERSION = 1;

class TelegramIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Chats store
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }

        // Messages store with indexes for quick query by chatId
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('chatId', 'chatId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings / user profile store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Chats ---
  public async getAllChats(): Promise<Chat[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readonly');
        const store = tx.objectStore('chats');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveChats(chats: Chat[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readwrite');
        const store = tx.objectStore('chats');
        for (const chat of chats) {
          store.put(chat);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save chats to IndexedDB:', err);
    }
  }

  public async saveChat(chat: Chat): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readwrite');
        const store = tx.objectStore('chats');
        store.put(chat);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save chat to IndexedDB:', err);
    }
  }

  public async deleteChat(chatId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['chats', 'messages'], 'readwrite');
        const chatStore = tx.objectStore('chats');
        const msgStore = tx.objectStore('messages');
        
        chatStore.delete(chatId);

        // Delete associated messages
        const index = msgStore.index('chatId');
        const request = index.openKeyCursor(IDBKeyRange.only(chatId));
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            msgStore.delete(cursor.primaryKey);
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to delete chat:', err);
    }
  }

  // --- Messages ---
  public async getMessages(chatId: string): Promise<Message[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('chatId');
        const request = index.getAll(IDBKeyRange.only(chatId));

        request.onsuccess = () => {
          const msgs: Message[] = request.result || [];
          // Sort ascending by timestamp
          msgs.sort((a, b) => a.timestamp - b.timestamp);
          resolve(msgs);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveMessage(message: Message): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        store.put(message);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save message:', err);
    }
  }

  public async saveMessages(messages: Message[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        for (const msg of messages) {
          store.put(msg);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save messages:', err);
    }
  }

  public async deleteMessage(messageId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        store.delete(messageId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to delete message:', err);
    }
  }

  // --- User Profile ---
  public async getProfile(): Promise<CurrentUserProfile | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('profile', 'readonly');
        const store = tx.objectStore('profile');
        const request = store.get('current_user');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveProfile(profile: CurrentUserProfile): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('profile', 'readwrite');
        const store = tx.objectStore('profile');
        store.put({ ...profile, id: 'current_user' });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  }

  // Clear all data (for testing / reset)
  public async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['chats', 'messages', 'profile'], 'readwrite');
        tx.objectStore('chats').clear();
        tx.objectStore('messages').clear();
        tx.objectStore('profile').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to clear database:', err);
    }
  }
}

export const dbService = new TelegramIndexedDB();
