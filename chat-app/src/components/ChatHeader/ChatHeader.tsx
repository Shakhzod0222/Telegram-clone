import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatHeader.module.css';
import type { Chat } from '../../types/index.ts';
import { Avatar } from '../Avatar/Avatar.tsx';
import { useTypingIndicator } from '../../hooks/useTypingIndicator.ts';

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onSearchClick?: () => void;
  onDeleteChat?: () => void;
  onMuteToggle?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack,
  onSearchClick,
  onDeleteChat,
  onMuteToggle,
}) => {
  const { isTyping, typingText } = useTypingIndicator(chat.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [callAlert, setCallAlert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or Escape
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  // Compute status line
  const renderStatus = () => {
    if (isTyping) {
      return (
        <span className={styles.typingStatus}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
          &nbsp;{typingText}
        </span>
      );
    }

    if (chat.type === 'bot') {
      return <span>bot</span>;
    }

    if (chat.type === 'channel') {
      return <span>{chat.memberCount ? `${chat.memberCount.toLocaleString()} obunachi` : 'kanal'}</span>;
    }

    if (chat.type === 'group') {
      const total = chat.memberCount ?? chat.members?.length ?? 1;
      const online = chat.onlineCount ?? 2;
      return <span>{total} a'zo, {online} onlayn</span>;
    }

    if (chat.isOnline) {
      return <span className={styles.onlineStatus}>onlayn</span>;
    }

    return <span>{chat.lastSeen || 'oxirgi marta 12:40'}</span>;
  };

  const handleCall = () => {
    setCallAlert(true);
    setTimeout(() => setCallAlert(false), 3000);
  };

  return (
    <header className={styles.header} aria-label={`${chat.title} bilan suhbat sarlavhasi`}>
      <div className={styles.leftSection}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Orqaga, chatlar ro'yxatiga qaytish"
          title="Orqaga"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <Avatar
          name={chat.title}
          avatarUrl={chat.avatarUrl}
          isOnline={chat.type === 'direct' ? chat.isOnline : false}
          size="lg"
          showOnline={chat.type === 'direct'}
        />

        <div className={styles.chatInfo}>
          <div className={styles.titleRow}>
            <span className={styles.title}>{chat.title}</span>
            {chat.isVerified && (
              <span className={styles.verifiedBadge} title="Tasdiqlangan hisob">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.8-3.8 1.4-1.4 2.4 2.4 5.4-5.4 1.4 1.4-6.8 6.8z" />
                </svg>
              </span>
            )}
          </div>

          <div className={styles.status}>{renderStatus()}</div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        {/* Call button */}
        {chat.type === 'direct' && (
          <button
            className={styles.actionBtn}
            onClick={handleCall}
            aria-label="Ovozli qo'ng'iroq"
            title="Qo'ng'iroq qilish"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.82l1.97-1.61a.996.996 0 00.25-1.02c-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
          </button>
        )}

        {/* Search inside chat button */}
        <button
          className={styles.actionBtn}
          onClick={onSearchClick}
          aria-label="Xabarlar ichidan qidiruv"
          title="Qidiruv"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Menu button */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className={styles.actionBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Ko'proq amallar menyusi"
            aria-expanded={menuOpen}
            title="Boshqa amallar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {menuOpen && (
            <div className={styles.dropdownMenu} role="menu">
              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => {
                  onMuteToggle?.();
                  setMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
                </svg>
                {chat.isMuted ? 'Ovozni yoqish' : 'Ovozsiz qilish'}
              </button>

              <button
                className={`${styles.dropdownItem} ${styles.dangerItem}`}
                role="menuitem"
                onClick={() => {
                  onDeleteChat?.();
                  setMenuOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Chatni o'chirish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating call simulation banner */}
      {callAlert && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            right: '20px',
            backgroundColor: 'var(--accent-color)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--dropdown-shadow)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          role="alert"
        >
          <span>📞 {chat.title} bilan bog'lanilmoqda...</span>
        </div>
      )}
    </header>
  );
};
