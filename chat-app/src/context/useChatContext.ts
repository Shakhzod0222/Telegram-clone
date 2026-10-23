import { createContext, useContext } from 'react';
import type { ChatState, ChatAction } from './types.ts';

export interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
