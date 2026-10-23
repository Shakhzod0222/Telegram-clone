import React, { useRef } from 'react';
import styles from './Sidebar.module.css';
import { useChats } from '../../hooks/useChats.ts';
import { FolderTabs } from '../FolderTabs/FolderTabs.tsx';
import { ChatListItem } from '../ChatListItem/ChatListItem.tsx';
import { useChatContext } from '../../context/useChatContext.ts';
import type { Chat } from '../../types/index.ts';

interface SidebarProps {
  isMobileHidden?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileHidden }) => {
  const {
    chats,
    activeChatId,
    activeFolderId,
    folders,
    searchQuery,
    selectChat,
    setFolder,
    setSearch,
  } = useChats();

  const { dispatch } = useChatContext();
  const chatListRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    dispatch({
      type: 'OPEN_CONTEXT_MENU',
      payload: {
        x: e.clientX,
        y: e.clientY,
        type: 'chat',
        targetId: chat.id,
        chat,
      },
    });
  };

  // Up/Down keyboard navigation through chats
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (chats.length === 0) return;
    const currentIndex = chats.findIndex((c) => c.id === activeChatId);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < chats.length - 1 ? currentIndex + 1 : 0;
      selectChat(chats[nextIndex].id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : chats.length - 1;
      selectChat(chats[prevIndex].id);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${isMobileHidden ? styles.sidebarHiddenOnMobile : ''}`}
      aria-label="Telegram Yon Paneli"
    >
      {/* Top Search & Menu Bar */}
      <div className={styles.topBar}>
        <button
          className={styles.menuBtn}
          onClick={() => dispatch({ type: 'OPEN_SETTINGS', payload: true })}
          aria-label="Sozlamalar va menyu"
          title="Menyu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="Qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearch('');
            }}
            aria-label="Chatlar bo'yicha qidiruv"
          />

          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearch('')}
              aria-label="Qidiruvni tozalash"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <button
          className={styles.newChatBtn}
          onClick={() => dispatch({ type: 'OPEN_NEW_CHAT', payload: true })}
          aria-label="Yangi chat yaratish"
          title="Yangi chat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Folder Tabs */}
      <FolderTabs
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setFolder}
      />

      {/* Chat List */}
      <div
        ref={chatListRef}
        className={styles.chatList}
        role="listbox"
        aria-label="Suhbatlar ro'yxati"
        tabIndex={0}
        onKeyDown={handleListKeyDown}
      >
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={selectChat}
              onContextMenu={handleContextMenu}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 10l4 4m0-4l-4 4" />
              </svg>
            </div>
            <p>Chatlar topilmadi</p>
          </div>
        )}
      </div>
    </aside>
  );
};
