import { useEffect, useMemo, useCallback } from 'react';
import { useChatContext } from '../context/useChatContext.ts';
import type { Message, Attachment, ReplyInfo } from '../types/index.ts';
import { chatService } from '../services/chatService.ts';
import { useBroadcast } from './useBroadcast.ts';

export function useMessages(chatId: string | null) {
  const { state, dispatch } = useChatContext();
  const { broadcast } = useBroadcast();
  const { messagesByChat, replyingToMessage, profile, chats } = state;

  const messages = useMemo(() => {
    if (!chatId) return [];
    return messagesByChat[chatId] || [];
  }, [messagesByChat, chatId]);

  // Active chat object
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === chatId);
  }, [chats, chatId]);

  // Load messages from DB / service if not already loaded
  useEffect(() => {
    if (!chatId) return;

    if (!messagesByChat[chatId]) {
      chatService.getMessages(chatId).then((loadedMsgs) => {
        dispatch({
          type: 'LOAD_MESSAGES',
          payload: { chatId, messages: loadedMsgs },
        });
      });
    }
  }, [chatId, messagesByChat, dispatch]);

  // Pinned message
  const pinnedMessage = useMemo(() => {
    if (!activeChat?.pinnedMessageId) return undefined;
    return messages.find((m) => m.id === activeChat.pinnedMessageId);
  }, [activeChat, messages]);

  const setReplyingTo = useCallback(
    (msg: Message | null) => {
      dispatch({ type: 'SET_REPLY_MESSAGE', payload: msg });
    },
    [dispatch]
  );

  // Send message with optimistic update
  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      if (!chatId || (!text.trim() && (!attachments || attachments.length === 0))) {
        return;
      }

      const tempId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      let replyTo: ReplyInfo | undefined;
      if (replyingToMessage) {
        replyTo = {
          messageId: replyingToMessage.id,
          senderName: replyingToMessage.senderName,
          textSnippet: replyingToMessage.text.slice(0, 50),
        };
      }

      const optimisticMsg: Message = {
        id: tempId,
        chatId,
        senderId: profile.id,
        senderName: profile.name,
        text: text.trim(),
        timestamp: Date.now(),
        status: 'sending',
        isOutgoing: true,
        replyTo,
        attachments,
      };

      // 1. Instantly display in UI (Optimistic update)
      dispatch({
        type: 'SEND_MESSAGE_OPTIMISTIC',
        payload: optimisticMsg,
      });

      // Clear reply state
      dispatch({ type: 'SET_REPLY_MESSAGE', payload: null });

      // Save to IndexedDB
      await chatService.saveMessage(optimisticMsg);

      // Broadcast to other tabs
      broadcast({ type: 'NEW_MESSAGE', payload: optimisticMsg });

      // 2. Transition to 'sent' after 350ms (simulating network send)
      setTimeout(async () => {
        dispatch({
          type: 'UPDATE_MESSAGE_STATUS',
          payload: { chatId, messageId: tempId, status: 'sent' },
        });
        await chatService.saveMessage({ ...optimisticMsg, status: 'sent' });
        broadcast({
          type: 'MESSAGE_STATUS',
          payload: { chatId, messageId: tempId, status: 'sent' },
        });

        // 3. Transition to 'read' after another 800ms
        setTimeout(async () => {
          dispatch({
            type: 'UPDATE_MESSAGE_STATUS',
            payload: { chatId, messageId: tempId, status: 'read' },
          });
          await chatService.saveMessage({ ...optimisticMsg, status: 'read' });
          broadcast({
            type: 'MESSAGE_STATUS',
            payload: { chatId, messageId: tempId, status: 'read' },
          });
        }, 800);
      }, 350);

      // 4. Simulate peer reply if not in benchmark or channel
      if (activeChat && activeChat.id !== 'chat_bench' && activeChat.type !== 'channel') {
        const replyDelay = 1400 + Math.random() * 1200;
        setTimeout(() => {
          const autoReply = chatService.generateSimulatedReply(activeChat, text);
          if (autoReply) {
            dispatch({ type: 'RECEIVE_MESSAGE', payload: autoReply });
            chatService.saveMessage(autoReply);
            broadcast({ type: 'NEW_MESSAGE', payload: autoReply });
          }
        }, replyDelay);
      }
    },
    [chatId, profile, replyingToMessage, activeChat, dispatch, broadcast]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) return;
      dispatch({ type: 'DELETE_MESSAGE', payload: { chatId, messageId } });
      await chatService.deleteMessage(messageId);
    },
    [chatId, dispatch]
  );

  const pinMessage = useCallback(
    async (messageId: string) => {
      if (!chatId) return;
      dispatch({ type: 'PIN_MESSAGE', payload: { chatId, messageId } });
      if (activeChat) {
        await chatService.saveChat({ ...activeChat, pinnedMessageId: messageId });
      }
      broadcast({ type: 'PIN_MESSAGE', payload: { chatId, messageId } });
    },
    [chatId, activeChat, dispatch, broadcast]
  );

  const unpinMessage = useCallback(async () => {
    if (!chatId) return;
    dispatch({ type: 'UNPIN_MESSAGE', payload: { chatId } });
    if (activeChat) {
      await chatService.saveChat({ ...activeChat, pinnedMessageId: undefined });
    }
  }, [chatId, activeChat, dispatch]);

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!chatId) return;
      dispatch({
        type: 'ADD_REACTION',
        payload: { chatId, messageId, emoji, userId: profile.id },
      });
      broadcast({
        type: 'REACTION',
        payload: { chatId, messageId, emoji, userId: profile.id },
      });
    },
    [chatId, profile.id, dispatch, broadcast]
  );

  return {
    messages,
    pinnedMessage,
    replyingToMessage,
    setReplyingTo,
    sendMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    addReaction,
  };
}
