import React, { useState, useEffect } from 'react';
import styles from './NewChatDialog.module.css';
import { useChatContext } from '../../context/useChatContext.ts';
import { useChats } from '../../hooks/useChats.ts';
import { CONTACT_USERS } from '../../services/mockData.ts';
import { Avatar } from '../Avatar/Avatar.tsx';
import type { Chat, ChatType } from '../../types/index.ts';

export const NewChatDialog: React.FC = () => {
  const { state, dispatch } = useChatContext();
  const { createChat, selectChat } = useChats();
  const [chatType, setChatType] = useState<ChatType>('direct');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'OPEN_NEW_CHAT', payload: false });
      }
    };
    if (state.isNewChatOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isNewChatOpen, dispatch]);

  if (!state.isNewChatOpen) return null;

  const handleClose = () => {
    dispatch({ type: 'OPEN_NEW_CHAT', payload: false });
  };

  const handleToggleUser = (userId: string) => {
    if (chatType === 'direct') {
      setSelectedUserIds([userId]);
      const user = CONTACT_USERS.find((u) => u.id === userId);
      if (user) setTitle(user.name);
    } else {
      setSelectedUserIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newChatId = `chat_${chatType}_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      type: chatType,
      title: title.trim(),
      description: description.trim() || undefined,
      unreadCount: 0,
      isVerified: false,
      isPinned: false,
      memberCount: chatType === 'group' ? selectedUserIds.length + 1 : undefined,
      lastMessage: {
        id: `msg_init_${Date.now()}`,
        text: chatType === 'channel' ? 'Kanal yaratildi' : 'Chat yaratildi',
        timestamp: Date.now(),
        senderName: state.profile.name,
        status: 'read',
      },
    };

    await createChat(newChat);
    selectChat(newChatId);
    handleClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Yangi chat yaratish oynasi"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Yangi suhbat</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Yopish">
            ✕
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${chatType === 'direct' ? styles.activeTab : ''}`}
            onClick={() => setChatType('direct')}
          >
            Shaxsiy
          </button>
          <button
            type="button"
            className={`${styles.tab} ${chatType === 'group' ? styles.activeTab : ''}`}
            onClick={() => setChatType('group')}
          >
            Yangi guruh
          </button>
          <button
            type="button"
            className={`${styles.tab} ${chatType === 'channel' ? styles.activeTab : ''}`}
            onClick={() => setChatType('channel')}
          >
            Yangi kanal
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {chatType === 'direct' ? 'Suhbatdoshingiz ismi' : chatType === 'group' ? 'Guruh nomi' : 'Kanal nomi'}
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nomini kiriting..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {chatType !== 'direct' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Tavsif (ixtiyoriy)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Chat tavsifi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}

            {chatType !== 'channel' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {chatType === 'direct' ? 'Kontakt tanlang:' : "A'zolarni tanlang:"}
                </label>
                <div className={styles.userList}>
                  {CONTACT_USERS.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`${styles.userItem} ${isSelected ? styles.selectedUserItem : ''}`}
                        onClick={() => handleToggleUser(user.id)}
                      >
                        <Avatar name={user.name} size="sm" isOnline={user.isOnline} />
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userMeta}>@{user.username}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              Bekor qilish
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!title.trim()}>
              Yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
