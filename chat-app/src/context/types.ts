import type {
  Chat,
  Message,
  CurrentUserProfile,
  FolderId,
  MessageStatus,
} from '../types/index.ts';

export interface TypingInfo {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface ContextMenuState {
  x: number;
  y: number;
  type: 'message' | 'chat';
  targetId: string;
  message?: Message;
  chat?: Chat;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  activeFolderId: FolderId;
  messagesByChat: Record<string, Message[]>;
  loading: boolean;
  searchQuery: string;
  typingUsers: Record<string, TypingInfo[]>; // chatId -> list of typing users
  profile: CurrentUserProfile;
  isSettingsOpen: boolean;
  isNewChatOpen: boolean;
  replyingToMessage: Message | null;
  contextMenu: ContextMenuState | null;
}

export type ChatAction =
  | { type: 'INIT_DATA'; payload: { chats: Chat[]; profile: CurrentUserProfile } }
  | { type: 'SELECT_CHAT'; payload: string | null }
  | { type: 'SET_FOLDER'; payload: FolderId }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'LOAD_MESSAGES'; payload: { chatId: string; messages: Message[] } }
  | { type: 'SEND_MESSAGE_OPTIMISTIC'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: string; chatId: string; status: MessageStatus } }
  | { type: 'RECEIVE_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: { messageId: string; chatId: string } }
  | { type: 'PIN_MESSAGE'; payload: { messageId: string; chatId: string } }
  | { type: 'UNPIN_MESSAGE'; payload: { chatId: string } }
  | { type: 'ADD_REACTION'; payload: { messageId: string; chatId: string; emoji: string; userId: string } }
  | { type: 'SET_USER_TYPING'; payload: { chatId: string; typingInfo: TypingInfo } }
  | { type: 'CLEAR_USER_TYPING'; payload: { chatId: string; userId: string } }
  | { type: 'CREATE_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'PIN_CHAT'; payload: { chatId: string; isPinned: boolean } }
  | { type: 'MUTE_CHAT'; payload: { chatId: string; isMuted: boolean } }
  | { type: 'MARK_CHAT_READ'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<CurrentUserProfile> }
  | { type: 'SET_REPLY_MESSAGE'; payload: Message | null }
  | { type: 'OPEN_SETTINGS'; payload: boolean }
  | { type: 'OPEN_NEW_CHAT'; payload: boolean }
  | { type: 'OPEN_CONTEXT_MENU'; payload: ContextMenuState }
  | { type: 'CLOSE_CONTEXT_MENU' };
