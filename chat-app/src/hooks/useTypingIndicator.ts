import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useChatContext } from '../context/useChatContext.ts';
import { useBroadcast } from './useBroadcast.ts';

export function useTypingIndicator(chatId: string | null) {
  const { state, dispatch } = useChatContext();
  const { broadcast } = useBroadcast();
  const lastSentRef = useRef<number>(0);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTyping = useMemo(() => {
    if (!chatId) return [];
    return state.typingUsers[chatId] || [];
  }, [state.typingUsers, chatId]);

  // Clean up stale typing statuses (> 3 seconds old)
  useEffect(() => {
    if (!chatId || activeTyping.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      for (const user of activeTyping) {
        if (now - user.timestamp > 3500) {
          dispatch({
            type: 'CLEAR_USER_TYPING',
            payload: { chatId, userId: user.userId },
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chatId, activeTyping, dispatch]);

  // Format typing text (e.g., "Alisher yozmoqda...", "Alisher va Madina yozmoqda...")
  const typingText = useMemo(() => {
    if (activeTyping.length === 0) return '';
    if (activeTyping.length === 1) {
      return `${activeTyping[0].userName} yozmoqda...`;
    }
    if (activeTyping.length === 2) {
      return `${activeTyping[0].userName} va ${activeTyping[1].userName} yozmoqda...`;
    }
    return `${activeTyping.length} kishi yozmoqda...`;
  }, [activeTyping]);

  // Emit current user typing event
  const sendTyping = useCallback(() => {
    if (!chatId) return;

    const now = Date.now();
    // Throttle broadcast every 2 seconds
    if (now - lastSentRef.current > 2000) {
      lastSentRef.current = now;
      broadcast({
        type: 'TYPING',
        payload: {
          chatId,
          userId: state.profile.id,
          userName: state.profile.name,
          isTyping: true,
        },
      });
    }

    // Schedule stop typing broadcast
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      broadcast({
        type: 'TYPING',
        payload: {
          chatId,
          userId: state.profile.id,
          userName: state.profile.name,
          isTyping: false,
        },
      });
    }, 2500);
  }, [chatId, state.profile.id, state.profile.name, broadcast]);

  return {
    isTyping: activeTyping.length > 0,
    typingText,
    typingUsers: activeTyping,
    sendTyping,
  };
}
