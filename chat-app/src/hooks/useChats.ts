import { useMemo, useCallback } from 'react';
import { useChatContext } from '../context/useChatContext.ts';
import type { Chat, Folder, FolderId } from '../types/index.ts';
import { chatService } from '../services/chatService.ts';

export function useChats() {
  const { state, dispatch } = useChatContext();
  const { chats, activeChatId, activeFolderId, searchQuery } = state;

  // Active chat object
  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId);
  }, [chats, activeChatId]);

  // Compute folder unread counts
  const folders = useMemo<Folder[]>(() => {
    const counts: Record<FolderId, number> = {
      all: 0,
      personal: 0,
      groups: 0,
      channels: 0,
      unread: 0,
      bots: 0,
    };

    for (const chat of chats) {
      const unread = chat.unreadCount;
      counts.all += unread;
      if (chat.type === 'direct') counts.personal += unread;
      if (chat.type === 'group') counts.groups += unread;
      if (chat.type === 'channel') counts.channels += unread;
      if (chat.type === 'bot') counts.bots += unread;
      if (unread > 0) counts.unread += unread;
    }

    return [
      { id: 'all', name: 'Barchasi', badge: counts.all },
      { id: 'personal', name: 'Shaxsiy', badge: counts.personal },
      { id: 'groups', name: 'Guruhlar', badge: counts.groups },
      { id: 'channels', name: 'Kanallar', badge: counts.channels },
      { id: 'unread', name: "O'qilmagan", badge: counts.unread },
      { id: 'bots', name: 'Botlar', badge: counts.bots },
    ];
  }, [chats]);

  // Filter chats by active folder and search query
  const filteredChats = useMemo(() => {
    let result = chats;

    // Filter by folder
    if (activeFolderId === 'personal') {
      result = result.filter((c) => c.type === 'direct');
    } else if (activeFolderId === 'groups') {
      result = result.filter((c) => c.type === 'group');
    } else if (activeFolderId === 'channels') {
      result = result.filter((c) => c.type === 'channel');
    } else if (activeFolderId === 'unread') {
      result = result.filter((c) => c.unreadCount > 0);
    } else if (activeFolderId === 'bots') {
      result = result.filter((c) => c.type === 'bot');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.lastMessage?.text.toLowerCase().includes(q)
      );
    }

    return result;
  }, [chats, activeFolderId, searchQuery]);

  const selectChat = useCallback(
    (chatId: string | null) => {
      dispatch({ type: 'SELECT_CHAT', payload: chatId });
    },
    [dispatch]
  );

  const setFolder = useCallback(
    (folderId: FolderId) => {
      dispatch({ type: 'SET_FOLDER', payload: folderId });
    },
    [dispatch]
  );

  const setSearch = useCallback(
    (query: string) => {
      dispatch({ type: 'SET_SEARCH', payload: query });
    },
    [dispatch]
  );

  const pinChat = useCallback(
    async (chatId: string, isPinned: boolean) => {
      dispatch({ type: 'PIN_CHAT', payload: { chatId, isPinned } });
      const target = chats.find((c) => c.id === chatId);
      if (target) {
        await chatService.saveChat({ ...target, isPinned });
      }
    },
    [dispatch, chats]
  );

  const muteChat = useCallback(
    async (chatId: string, isMuted: boolean) => {
      dispatch({ type: 'MUTE_CHAT', payload: { chatId, isMuted } });
      const target = chats.find((c) => c.id === chatId);
      if (target) {
        await chatService.saveChat({ ...target, isMuted });
      }
    },
    [dispatch, chats]
  );

  const markChatRead = useCallback(
    async (chatId: string) => {
      dispatch({ type: 'MARK_CHAT_READ', payload: chatId });
      const target = chats.find((c) => c.id === chatId);
      if (target) {
        await chatService.saveChat({ ...target, unreadCount: 0 });
      }
    },
    [dispatch, chats]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
      await chatService.deleteChat(chatId);
    },
    [dispatch]
  );

  const createChat = useCallback(
    async (newChat: Chat): Promise<void> => {
      dispatch({ type: 'CREATE_CHAT', payload: newChat });
      await chatService.saveChat(newChat);
    },
    [dispatch]
  );

  return {
    chats: filteredChats,
    allChats: chats,
    activeChat,
    activeChatId,
    activeFolderId,
    folders,
    searchQuery,
    selectChat,
    setFolder,
    setSearch,
    pinChat,
    muteChat,
    markChatRead,
    deleteChat,
    createChat,
  };
}
