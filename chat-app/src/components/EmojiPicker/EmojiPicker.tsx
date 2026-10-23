import React, { useState, useRef, useEffect } from 'react';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
  isOpen: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
    ],
  },
  {
    name: 'Reactions & Hearts',
    icon: '🔥',
    emojis: [
      '👍', '👎', '👏', '🙌', '🤝', '👊', '🤞', '✌️', '🤟', '👌',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '🔥', '✨', '🌟', '💥', '💯', '🎯', '🎉', '🎊', '🚀', '⚡'
    ],
  },
  {
    name: 'Objects',
    icon: '💻',
    emojis: [
      '💻', '📱', '⌨️', '🖥', '💡', '📚', '📦', '🔒', '🔑', '⚙️',
      '🛠', '🎧', '📷', '🎮', '🏆', '🎨', '✉️', '📌', '📎', '⏰'
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onSelectEmoji,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategory = EMOJI_CATEGORIES[activeCategory];
  const displayedEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((emoji) => emoji.includes(search.trim()))
    : currentCategory.emojis;

  return (
    <div
      ref={pickerRef}
      className={styles.pickerContainer}
      role="dialog"
      aria-label="Emoji tanlash paneli"
    >
      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Emojilarni qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className={styles.tabsBar}>
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            className={`${styles.tabBtn} ${activeCategory === idx ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveCategory(idx);
              setSearch('');
            }}
            title={cat.name}
            type="button"
          >
            {cat.icon}
          </button>
        ))}
      </div>

      <div className={styles.emojiGrid}>
        {displayedEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            className={styles.emojiBtn}
            onClick={() => onSelectEmoji(emoji)}
            type="button"
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
