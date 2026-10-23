import React, { useEffect } from 'react';
import styles from './SettingsPanel.module.css';
import { useChatContext } from '../../context/useChatContext.ts';
import { useChats } from '../../hooks/useChats.ts';
import { Avatar } from '../Avatar/Avatar.tsx';
import { chatService } from '../../services/chatService.ts';

export const SettingsPanel: React.FC = () => {
  const { state, dispatch } = useChatContext();
  const { selectChat } = useChats();
  const { profile, isSettingsOpen } = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'OPEN_SETTINGS', payload: false });
      }
    };
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, dispatch]);

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    dispatch({ type: 'OPEN_SETTINGS', payload: false });
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { theme: newTheme } });
    chatService.saveProfile({ ...profile, theme: newTheme });
  };

  const handleOpenBenchmark = () => {
    selectChat('chat_bench');
    handleClose();
  };

  const handleResetData = async () => {
    if (window.confirm('Barcha xabarlar va chatlarni boshlang\'ich holatga qaytarishni xohlaysizmi?')) {
      const { chats, profile: newProfile } = await chatService.resetAllData();
      dispatch({ type: 'INIT_DATA', payload: { chats, profile: newProfile } });
      handleClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleClose} />

      <aside className={styles.panel} role="dialog" aria-label="Sozlamalar paneli">
        <div className={styles.header}>
          <h2 className={styles.title}>Sozlamalar</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Yopish">
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* Profile overview */}
          <div className={styles.profileSection}>
            <Avatar name={profile.name} size="xl" isOnline={true} />
            <div className={styles.profileName}>{profile.name}</div>
            <div className={styles.profileUsername}>@{profile.username}</div>
            {profile.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{profile.bio}</p>}
          </div>

          {/* Theme settings */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Mavzu (Theme)</span>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>Ilova ko'rinishi</span>
              <div className={styles.themeButtons}>
                <button
                  className={`${styles.themeBtn} ${profile.theme === 'light' ? styles.activeThemeBtn : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  ☀️ Yorug'
                </button>
                <button
                  className={`${styles.themeBtn} ${profile.theme === 'dark' ? styles.activeThemeBtn : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  🌙 Qorong'u
                </button>
              </div>
            </div>
          </div>

          {/* Performance Benchmark */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Performance & Virtual Scroll</span>
            <button className={styles.benchBtn} onClick={handleOpenBenchmark}>
              🚀 1000+ Xabarlar Testiga O'tish
            </button>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              1200+ xabar yuklangan guruhda virtual scrolling silliqligini tekshiring.
            </p>
          </div>

          {/* Danger zone */}
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Xotira va Qayta tiklash</span>
            <button className={styles.resetBtn} onClick={handleResetData}>
              Ma'lumotlarni qayta tiklash
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
