import type { MessageStatus } from './message.ts';

export type ChatType = 'direct' | 'group' | 'channel' | 'bot';

export interface ChatMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
  isOnline?: boolean;
}

export interface LastMessageInfo {
  id: string;
  text: string;
  timestamp: number;
  senderName?: string;
  senderId?: string;
  status?: MessageStatus;
  isOutgoing?: boolean;
}

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  unreadCount: number;
  lastMessage?: LastMessageInfo;
  members?: ChatMember[];
  memberCount?: number;
  onlineCount?: number;
  pinnedMessageId?: string;
  description?: string;
  username?: string;
  draft?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export type FolderId = 'all' | 'personal' | 'groups' | 'channels' | 'unread' | 'bots';

export interface Folder {
  id: FolderId;
  name: string;
  badge?: number;
}
