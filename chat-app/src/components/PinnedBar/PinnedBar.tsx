import React from 'react';
import styles from './PinnedBar.module.css';
import type { Message } from '../../types/index.ts';

interface PinnedBarProps {
  pinnedMessage: Message;
  onClick: () => void;
  onUnpin: () => void;
}

export const PinnedBar: React.FC<PinnedBarProps> = ({
  pinnedMessage,
  onClick,
  onUnpin,
}) => {
  return (
    <div
      className={styles.pinnedBar}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Qadalgan xabar: ${pinnedMessage.text}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.leftSection}>
        <div className={styles.indicatorLine} />
        <div className={styles.content}>
          <span className={styles.title}>Qadalgan xabar</span>
          <span className={styles.snippet}>
            {pinnedMessage.senderName ? `${pinnedMessage.senderName}: ` : ''}
            {pinnedMessage.text}
          </span>
        </div>
      </div>

      <button
        className={styles.unpinBtn}
        onClick={(e) => {
          e.stopPropagation();
          onUnpin();
        }}
        aria-label="Xabarni qadashdan chiqarish"
        title="Qadashdan chiqarish"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
