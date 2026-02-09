/**
 * Generate a deterministic random avatar URL for users without photos.
 * Uses DiceBear "notionists" style for interesting, unique avatars.
 */
export function getAvatarUrl(name: string, avatarUrl?: string | null): string {
  if (avatarUrl && avatarUrl.trim().length > 0) return avatarUrl;
  const seed = encodeURIComponent(name || "user");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=e8e0d4`;
}
