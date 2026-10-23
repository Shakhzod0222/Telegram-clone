// Telegram 8 distinct member colors for group chat headers & avatars
export const MEMBER_COLORS: readonly string[] = [
  '#e17076', // red / coral
  '#faa774', // orange
  '#a695e7', // purple
  '#7bc862', // green
  '#6ec9cb', // cyan
  '#65aadd', // light blue
  '#ee7aae', // pink
  '#e5a93d', // amber
] as const;

export function getMemberColor(nameOrId: string, indexOverride?: number): string {
  if (typeof indexOverride === 'number' && indexOverride >= 0) {
    return MEMBER_COLORS[indexOverride % MEMBER_COLORS.length];
  }
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = (hash << 5) - hash + nameOrId.charCodeAt(i);
    hash |= 0;
  }
  const colorIdx = Math.abs(hash) % MEMBER_COLORS.length;
  return MEMBER_COLORS[colorIdx];
}

export function getInitials(name: string): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
