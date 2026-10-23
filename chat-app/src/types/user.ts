export type UserStatus = 'online' | 'offline' | 'typing';

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
  isVerified?: boolean;
  isBot?: boolean;
  lastSeen?: string; // e.g. "12:40 da ko'rildi", "oxirgi marta hozirgina", etc.
  bio?: string;
  phone?: string;
  colorIndex?: number; // 0-7 for Telegram user color assignment in groups
}

export interface CurrentUserProfile extends User {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  enterToSend: boolean;
}
