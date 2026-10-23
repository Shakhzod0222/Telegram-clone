import React, { useRef } from 'react';
import styles from './FolderTabs.module.css';
import type { Folder, FolderId } from '../../types/index.ts';

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: FolderId;
  onSelectFolder: (id: FolderId) => void;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % folders.length;
      onSelectFolder(folders[nextIdx].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + folders.length) % folders.length;
      onSelectFolder(folders[prevIdx].id);
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="tablist"
      aria-label="Chat papkalari"
    >
      {folders.map((folder, index) => {
        const isActive = folder.id === activeFolderId;
        return (
          <button
            key={folder.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${folder.id}`}
            id={`tab-${folder.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onSelectFolder(folder.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span>{folder.name}</span>
            {folder.badge !== undefined && folder.badge > 0 && (
              <span className={styles.badge} aria-label={`${folder.badge} o'qilmagan xabar`}>
                {folder.badge > 99 ? '99+' : folder.badge}
              </span>
            )}
            {isActive && <div className={styles.activeIndicator} />}
          </button>
        );
      })}
    </div>
  );
};
