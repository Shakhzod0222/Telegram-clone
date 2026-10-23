import React from 'react';
import styles from './ChatListItem.module.css';
import type { Chat } from '../../types/index.ts';
import { Avatar } from '../Avatar/Avatar.tsx';
import { formatChatListTime } from '../../utils/formatters.ts';
import { useTypingIndicator } from '../../hooks/useTypingIndicator.ts';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, chat: Chat) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isActive,
  onSelect,
  onContextMenu,
}) => {
  const { isTyping, typingText } = useTypingIndicator(chat.id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(chat.id);
    }
  };

  const lastMsg = chat.lastMessage;

  return (
    <div
      role="option"
      aria-selected={isActive}
      tabIndex={0}
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      onClick={() => onSelect(chat.id)}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => onContextMenu(e, chat)}
      aria-label={`${chat.title}, ${chat.unreadCount > 0 ? `${chat.unreadCount} ta yangi xabar` : ''}`}
    >
      <Avatar
        name={chat.title}
        avatarUrl={chat.avatarUrl}
        isOnline={chat.type === 'direct' ? chat.isOnline : false}
        size="md"
        showOnline={chat.type === 'direct'}
      />

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.title}>{chat.title}</span>
            {chat.isVerified && (
              <span className={styles.verifiedBadge} title="Tasdiqlangan">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.8-3.8 1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4-6.8 6.8z" />
                </svg>
              </span>
            )}
          </div>

          <div className={styles.metaArea}>
            {lastMsg?.isOutgoing && (
              <span className={styles.statusIcon} title={lastMsg.status}>
                {lastMsg.status === 'sending' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 15" />
                  </svg>
                ) : lastMsg.status === 'read' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17l-4.24-4.24-1.41 1.41 5.66 5.66L23.66 7l-1.42-1.41zM.41 13.41L6.07 19.07l1.41-1.41L1.83 12 .41 13.41z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </span>
            )}

            {lastMsg?.timestamp && (
              <span className={styles.time}>{formatChatListTime(lastMsg.timestamp)}</span>
            )}
          </div>
        </div>

        <div className={styles.messageRow}>
          <div className={styles.snippet}>
            {isTyping ? (
              <span className={styles.typingText}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                &nbsp;{typingText}
              </span>
            ) : (
              <>
                {chat.type === 'group' && lastMsg?.senderName && (
                  <span className={styles.senderPrefix}>
                    {lastMsg.isOutgoing ? 'Siz: ' : `${lastMsg.senderName.split(' ')[0]}: `}
                  </span>
                )}
                <span>{lastMsg ? lastMsg.text : 'Xabarlar yo\'q'}</span>
              </>
            )}
          </div>

          <div className={styles.badgeArea}>
            {chat.isMuted && (
              <span className={styles.muteIcon} title="Ovozsiz">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27l4.73 4.73H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09l2.09 2.09V4z" />
                </svg>
              </span>
            )}

            {chat.isPinned && (
              <span className={styles.pinIcon} title="Qadalgan">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              </span>
            )}

            {chat.unreadCount > 0 && (
              <span
                className={`${styles.unreadBadge} ${chat.isMuted ? styles.unreadBadgeMuted : ''}`}
                aria-label={`${chat.unreadCount} ta o'qilmagan xabar`}
              >
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
