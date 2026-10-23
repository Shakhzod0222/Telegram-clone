import React, { useReducer, useEffect } from 'react';
import { chatReducer, initialChatState } from './chatReducer.ts';
import { chatService } from '../services/chatService.ts';
import { ChatContext } from './useChatContext.ts';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    chatService.initialize().then(({ chats, profile }) => {
      if (isMounted) {
        dispatch({ type: 'INIT_DATA', payload: { chats, profile } });
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', profile.theme);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update HTML data-theme whenever profile theme changes
  useEffect(() => {
    if (state.profile?.theme) {
      document.documentElement.setAttribute('data-theme', state.profile.theme);
    }
  }, [state.profile?.theme]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
