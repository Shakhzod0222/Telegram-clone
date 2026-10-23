import { useEffect, useRef, useCallback } from 'react';
import { useChatContext } from '../context/useChatContext.ts';
import type { Message, MessageStatus } from '../types/index.ts';

export type BroadcastPayload =
  | { type: 'NEW_MESSAGE'; payload: Message }
  | { type: 'MESSAGE_STATUS'; payload: { chatId: string; messageId: string; status: MessageStatus } }
  | { type: 'TYPING'; payload: { chatId: string; userId: string; userName: string; isTyping: boolean } }
  | { type: 'REACTION'; payload: { chatId: string; messageId: string; emoji: string; userId: string } }
  | { type: 'PIN_MESSAGE'; payload: { chatId: string; messageId: string } };

const CHANNEL_NAME = 'telegram_clone_multi_tab_sync';

export function useBroadcast() {
  const { dispatch } = useChatContext();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<BroadcastPayload>) => {
        const data = event.data;
        if (!data || !data.type) return;

        switch (data.type) {
          case 'NEW_MESSAGE':
            dispatch({ type: 'RECEIVE_MESSAGE', payload: data.payload });
            break;
          case 'MESSAGE_STATUS':
            dispatch({
              type: 'UPDATE_MESSAGE_STATUS',
              payload: data.payload,
            });
            break;
          case 'TYPING':
            if (data.payload.isTyping) {
              dispatch({
                type: 'SET_USER_TYPING',
                payload: {
                  chatId: data.payload.chatId,
                  typingInfo: {
                    userId: data.payload.userId,
                    userName: data.payload.userName,
                    timestamp: Date.now(),
                  },
                },
              });
            } else {
              dispatch({
                type: 'CLEAR_USER_TYPING',
                payload: {
                  chatId: data.payload.chatId,
                  userId: data.payload.userId,
                },
              });
            }
            break;
          case 'REACTION':
            dispatch({
              type: 'ADD_REACTION',
              payload: data.payload,
            });
            break;
          case 'PIN_MESSAGE':
            dispatch({
              type: 'PIN_MESSAGE',
              payload: data.payload,
            });
            break;
        }
      };

      return () => {
        channel.close();
        channelRef.current = null;
      };
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }, [dispatch]);

  const broadcast = useCallback((payload: BroadcastPayload) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(payload);
      } catch (err) {
        console.warn('Failed to broadcast message:', err);
      }
    }
  }, []);

  return { broadcast };
}
