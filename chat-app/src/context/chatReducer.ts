import type { ChatState, ChatAction } from './types.ts';
import type { Chat, Message } from '../types/index.ts';

export const initialChatState: ChatState = {
  chats: [],
  activeChatId: null,
  activeFolderId: 'all',
  messagesByChat: {},
  loading: true,
  searchQuery: '',
  typingUsers: {},
  profile: {
    id: 'user_me',
    name: 'Shaxzod',
    username: 'shakhzod_dev',
    isOnline: true,
    theme: 'dark',
    soundEnabled: true,
    enterToSend: true,
  },
  isSettingsOpen: false,
  isNewChatOpen: false,
  replyingToMessage: null,
  contextMenu: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INIT_DATA': {
      return {
        ...state,
        chats: action.payload.chats,
        profile: action.payload.profile,
        loading: false,
      };
    }

    case 'SELECT_CHAT': {
      const selectedId = action.payload;
      if (!selectedId) {
        return { ...state, activeChatId: null, replyingToMessage: null };
      }

      // Mark selected chat as read automatically
      const updatedChats = state.chats.map((c) =>
        c.id === selectedId ? { ...c, unreadCount: 0 } : c
      );

      return {
        ...state,
        activeChatId: selectedId,
        chats: updatedChats,
        replyingToMessage: null,
      };
    }

    case 'SET_FOLDER': {
      return { ...state, activeFolderId: action.payload };
    }

    case 'SET_SEARCH': {
      return { ...state, searchQuery: action.payload };
    }

    case 'LOAD_MESSAGES': {
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [action.payload.chatId]: action.payload.messages,
        },
      };
    }

    case 'SEND_MESSAGE_OPTIMISTIC': {
      const msg = action.payload;
      const currentList = state.messagesByChat[msg.chatId] || [];

      // Avoid duplicates
      const exists = currentList.some((m) => m.id === msg.id);
      const updatedMessages = exists
        ? currentList.map((m) => (m.id === msg.id ? msg : m))
        : [...currentList, msg];

      // Update chat lastMessage and move to top (after pinned)
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === msg.chatId) {
          return {
            ...chat,
            lastMessage: {
              id: msg.id,
              text: msg.text || (msg.attachments?.length ? 'Fayl biriktirildi' : ''),
              timestamp: msg.timestamp,
              senderName: msg.senderName,
              senderId: msg.senderId,
              status: msg.status,
              isOutgoing: true,
            },
          };
        }
        return chat;
      });

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [msg.chatId]: updatedMessages,
        },
        chats: sortChats(updatedChats),
        replyingToMessage: null,
      };
    }

    case 'UPDATE_MESSAGE_STATUS': {
      const { chatId, messageId, status } = action.payload;
      const currentList = state.messagesByChat[chatId];
      if (!currentList) return state;

      const updatedMessages = currentList.map((m) =>
        m.id === messageId ? { ...m, status } : m
      );

      const updatedChats = state.chats.map((c) => {
        if (c.id === chatId && c.lastMessage?.id === messageId) {
          return {
            ...c,
            lastMessage: {
              ...c.lastMessage,
              status,
            },
          };
        }
        return c;
      });

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
        chats: updatedChats,
      };
    }

    case 'RECEIVE_MESSAGE': {
      const msg = action.payload;
      const currentList = state.messagesByChat[msg.chatId] || [];
      const isCurrentActive = state.activeChatId === msg.chatId;

      const updatedMessages = [...currentList, msg];

      const updatedChats = state.chats.map((chat) => {
        if (chat.id === msg.chatId) {
          return {
            ...chat,
            unreadCount: isCurrentActive ? 0 : chat.unreadCount + 1,
            lastMessage: {
              id: msg.id,
              text: msg.text || (msg.attachments?.length ? 'Fayl' : ''),
              timestamp: msg.timestamp,
              senderName: msg.senderName,
              senderId: msg.senderId,
              status: 'read' as const,
              isOutgoing: false,
            },
          };
        }
        return chat;
      });

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [msg.chatId]: updatedMessages,
        },
        chats: sortChats(updatedChats),
      };
    }

    case 'DELETE_MESSAGE': {
      const { chatId, messageId } = action.payload;
      const currentList = state.messagesByChat[chatId] || [];
      const updatedMessages = currentList.filter((m) => m.id !== messageId);

      // Re-evaluate last message if necessary
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === chatId && chat.lastMessage?.id === messageId) {
          const last = updatedMessages[updatedMessages.length - 1];
          return {
            ...chat,
            lastMessage: last
              ? {
                  id: last.id,
                  text: last.text,
                  timestamp: last.timestamp,
                  senderName: last.senderName,
                  senderId: last.senderId,
                  status: last.status,
                  isOutgoing: last.isOutgoing,
                }
              : undefined,
          };
        }
        return chat;
      });

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
        chats: updatedChats,
      };
    }

    case 'PIN_MESSAGE': {
      const { chatId, messageId } = action.payload;
      const currentList = state.messagesByChat[chatId] || [];
      const updatedMessages = currentList.map((m) => ({
        ...m,
        isPinned: m.id === messageId,
      }));

      const updatedChats = state.chats.map((c) =>
        c.id === chatId ? { ...c, pinnedMessageId: messageId } : c
      );

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
        chats: updatedChats,
      };
    }

    case 'UNPIN_MESSAGE': {
      const { chatId } = action.payload;
      const currentList = state.messagesByChat[chatId] || [];
      const updatedMessages = currentList.map((m) => ({
        ...m,
        isPinned: false,
      }));

      const updatedChats = state.chats.map((c) =>
        c.id === chatId ? { ...c, pinnedMessageId: undefined } : c
      );

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
        chats: updatedChats,
      };
    }

    case 'ADD_REACTION': {
      const { chatId, messageId, emoji, userId } = action.payload;
      const currentList = state.messagesByChat[chatId] || [];

      const updatedMessages = currentList.map((msg): Message => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const existingReaction = currentReactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          const alreadyReacted = existingReaction.users.includes(userId);
          if (alreadyReacted) {
            // Remove user reaction
            const newUsers = existingReaction.users.filter((u) => u !== userId);
            if (newUsers.length === 0) {
              return {
                ...msg,
                reactions: currentReactions.filter((r) => r.emoji !== emoji),
              };
            }
            return {
              ...msg,
              reactions: currentReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r
              ),
            };
          } else {
            // Add user to reaction
            return {
              ...msg,
              reactions: currentReactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, users: [...r.users, userId] }
                  : r
              ),
            };
          }
        } else {
          // New reaction emoji
          return {
            ...msg,
            reactions: [...currentReactions, { emoji, count: 1, users: [userId] }],
          };
        }
      });

      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
      };
    }

    case 'SET_USER_TYPING': {
      const { chatId, typingInfo } = action.payload;
      const currentTyping = state.typingUsers[chatId] || [];
      const filtered = currentTyping.filter((u) => u.userId !== typingInfo.userId);
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [...filtered, typingInfo],
        },
      };
    }

    case 'CLEAR_USER_TYPING': {
      const { chatId, userId } = action.payload;
      const currentTyping = state.typingUsers[chatId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [chatId]: currentTyping.filter((u) => u.userId !== userId),
        },
      };
    }

    case 'CREATE_CHAT': {
      return {
        ...state,
        chats: sortChats([action.payload, ...state.chats]),
        activeChatId: action.payload.id,
        isNewChatOpen: false,
      };
    }

    case 'UPDATE_CHAT': {
      const updated = state.chats.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
      return {
        ...state,
        chats: sortChats(updated),
      };
    }

    case 'DELETE_CHAT': {
      const chatId = action.payload;
      return {
        ...state,
        chats: state.chats.filter((c) => c.id !== chatId),
        activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
      };
    }

    case 'PIN_CHAT': {
      const { chatId, isPinned } = action.payload;
      const updated = state.chats.map((c) =>
        c.id === chatId ? { ...c, isPinned } : c
      );
      return {
        ...state,
        chats: sortChats(updated),
      };
    }

    case 'MUTE_CHAT': {
      const { chatId, isMuted } = action.payload;
      const updated = state.chats.map((c) =>
        c.id === chatId ? { ...c, isMuted } : c
      );
      return {
        ...state,
        chats: updated,
      };
    }

    case 'MARK_CHAT_READ': {
      const chatId = action.payload;
      const updated = state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      );
      return {
        ...state,
        chats: updated,
      };
    }

    case 'UPDATE_PROFILE': {
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };
    }

    case 'SET_REPLY_MESSAGE': {
      return {
        ...state,
        replyingToMessage: action.payload,
      };
    }

    case 'OPEN_SETTINGS': {
      return { ...state, isSettingsOpen: action.payload };
    }

    case 'OPEN_NEW_CHAT': {
      return { ...state, isNewChatOpen: action.payload };
    }

    case 'OPEN_CONTEXT_MENU': {
      return { ...state, contextMenu: action.payload };
    }

    case 'CLOSE_CONTEXT_MENU': {
      return { ...state, contextMenu: null };
    }

    default:
      return state;
  }
}

/**
 * Sorts chats prioritizing pinned chats at top, then by timestamp descending
 */
function sortChats(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessage?.timestamp ?? 0;
    const timeB = b.lastMessage?.timestamp ?? 0;
    return timeB - timeA;
  });
}
