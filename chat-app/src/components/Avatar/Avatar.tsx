import React, { useState } from 'react';
import styles from './Avatar.module.css';
import { getMemberColor, getInitials } from '../../utils/colors.ts';

export interface AvatarProps {
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorIndex?: number;
  className?: string;
  showOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  isOnline = false,
  size = 'md',
  colorIndex,
  className = '',
  showOnline = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const bgColor = getMemberColor(name, colorIndex);
  const initials = getInitials(name);

  return (
    <div
      className={`${styles.avatarContainer} ${styles[size]} ${className}`}
      style={{ backgroundColor: !avatarUrl || imageError ? bgColor : undefined }}
      aria-label={`${name} avatar`}
    >
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={name}
          className={styles.avatarImage}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span>{initials}</span>
      )}

      {showOnline && isOnline && (
        <span
          className={styles.onlineBadge}
          title="Onlayn"
          aria-label="Foydalanuvchi onlayn"
        />
      )}
    </div>
  );
};
