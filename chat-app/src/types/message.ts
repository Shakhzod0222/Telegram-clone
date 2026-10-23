import type { Attachment } from './attachment.ts';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who added this emoji
}

export interface ReplyInfo {
  messageId: string;
  senderName: string;
  textSnippet: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderColorIndex?: number;
  text: string;
  timestamp: number;
  status: MessageStatus;
  isOutgoing: boolean;
  replyTo?: ReplyInfo;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  isPinned?: boolean;
  isEdited?: boolean;
}
