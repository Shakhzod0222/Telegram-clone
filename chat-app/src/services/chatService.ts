import type { Chat, Message, CurrentUserProfile, MessageStatus } from '../types/index.ts';
import { dbService } from './db.ts';
import {
  CURRENT_USER,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  generateBenchmarkMessages,
  CONTACT_USERS,
} from './mockData.ts';

export class ChatService {
  private isInitialized = false;

  public async initialize(): Promise<{ chats: Chat[]; profile: CurrentUserProfile }> {
    if (this.isInitialized) {
      const chats = await dbService.getAllChats();
      let profile = await dbService.getProfile();
      if (!profile) profile = CURRENT_USER;
      return { chats, profile };
    }

    // Check if IndexedDB already has chats
    let chats = await dbService.getAllChats();
    let profile = await dbService.getProfile();

    if (!profile) {
      await dbService.saveProfile(CURRENT_USER);
      profile = CURRENT_USER;
    }

    if (chats.length === 0) {
      // Seed initial chats
      await dbService.saveChats(INITIAL_CHATS);
      chats = INITIAL_CHATS;

      // Seed initial messages
      for (const msgs of Object.values(INITIAL_MESSAGES)) {
        await dbService.saveMessages(msgs);
      }

      // Pre-seed benchmark chat messages
      const benchMsgs = generateBenchmarkMessages('chat_bench', 1200);
      await dbService.saveMessages(benchMsgs);
    }

    this.isInitialized = true;
    return { chats, profile };
  }

  public async getMessages(chatId: string): Promise<Message[]> {
    let msgs = await dbService.getMessages(chatId);

    // If benchmark chat is loaded for the first time without messages
    if (msgs.length === 0 && chatId === 'chat_bench') {
      msgs = generateBenchmarkMessages('chat_bench', 1200);
      await dbService.saveMessages(msgs);
    }

    return msgs;
  }

  public async saveMessage(message: Message): Promise<void> {
    await dbService.saveMessage(message);
  }

  public async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    try {
      const db = await dbService.getDB();
      const tx = db.transaction('messages', 'readwrite');
      const store = tx.objectStore('messages');
      const req = store.get(messageId);
      req.onsuccess = () => {
        const msg = req.result as Message | undefined;
        if (msg) {
          msg.status = status;
          store.put(msg);
        }
      };
    } catch (err) {
      console.warn('Failed to update message status:', err);
    }
  }

  public async saveChat(chat: Chat): Promise<void> {
    await dbService.saveChat(chat);
  }

  public async deleteChat(chatId: string): Promise<void> {
    await dbService.deleteChat(chatId);
  }

  public async deleteMessage(messageId: string): Promise<void> {
    await dbService.deleteMessage(messageId);
  }

  public async saveProfile(profile: CurrentUserProfile): Promise<void> {
    await dbService.saveProfile(profile);
  }

  public async resetAllData(): Promise<{ chats: Chat[]; profile: CurrentUserProfile }> {
    await dbService.clearAll();
    this.isInitialized = false;
    return this.initialize();
  }

  /**
   * Helper that simulates an automated contact reply after user sends a message.
   * Can be hooked up to an actual WebSocket or Firebase in production.
   */
  public generateSimulatedReply(chat: Chat, userMessageText: string): Message | null {
    if (chat.type === 'channel') return null;

    let senderId = 'user_1';
    let senderName = chat.title;
    let senderColorIndex = 0;

    if (chat.type === 'bot') {
      senderId = 'user_5';
      senderName = 'BotFather';
      senderColorIndex = 4;
    } else if (chat.type === 'group' && chat.members && chat.members.length > 0) {
      // Pick another member
      const otherMembers = chat.members.filter((m) => m.userId !== 'user_me');
      const pick = otherMembers[Math.floor(Math.random() * otherMembers.length)];
      if (pick) {
        senderId = pick.userId;
        senderName = pick.name;
        const contact = CONTACT_USERS.find((c) => c.id === pick.userId);
        senderColorIndex = contact?.colorIndex ?? 2;
      }
    }

    const replies = [
      `Qabul qilindi! "${userMessageText.slice(0, 20)}..." bo'yicha ma'lumot tekshirildi.`,
      `Ajoyib fikr! Telegram klon ilovasi juda tez ishlamoqda 🚀`,
      `Rahmat! Bu xabarni eslab qolamiz. Yana qanday yangiliklar bor?`,
      `Virtual scroll va IndexedDB sinovi muvaffaqiyatli o'tdi 👍`,
    ];

    const replyText = replies[Math.floor(Math.random() * replies.length)];

    return {
      id: `msg_auto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatId: chat.id,
      senderId,
      senderName,
      senderColorIndex,
      text: replyText,
      timestamp: Date.now(),
      status: 'read',
      isOutgoing: false,
    };
  }
}

export const chatService = new ChatService();
