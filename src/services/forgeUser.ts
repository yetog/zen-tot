/**
 * Forge User Service
 *
 * Manages user identification across all Forge apps.
 * Uses localStorage to persist a UUID that's shared across:
 * - The Forge Hub
 * - Zen ToT (Mind)
 * - Forge Fit (Body)
 * - Zen Reset (Spirit)
 * - FineLine (Reflect)
 * - Questful Living
 *
 * All apps on zaylegend.com share the same localStorage.
 */

const FORGE_USER_KEY = 'forge_user_id';
const FORGE_USER_CREATED_KEY = 'forge_user_created';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create the Forge user ID.
 * This ID is shared across all Forge apps.
 */
export function getForgeUserId(): string {
  let userId = localStorage.getItem(FORGE_USER_KEY);

  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(FORGE_USER_KEY, userId);
    localStorage.setItem(FORGE_USER_CREATED_KEY, new Date().toISOString());
    console.log('[Forge] Created new user ID:', userId);
  }

  return userId;
}

/**
 * Get user creation date
 */
export function getForgeUserCreatedAt(): string | null {
  return localStorage.getItem(FORGE_USER_CREATED_KEY);
}

/**
 * Check if this is a new user (created in this session)
 */
export function isNewUser(): boolean {
  const created = localStorage.getItem(FORGE_USER_CREATED_KEY);
  if (!created) return true;

  const createdDate = new Date(created);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = diffMs / (1000 * 60);

  // Consider "new" if created within last 5 minutes
  return diffMins < 5;
}

/**
 * Reset user ID (for testing/debugging)
 */
export function resetForgeUser(): string {
  localStorage.removeItem(FORGE_USER_KEY);
  localStorage.removeItem(FORGE_USER_CREATED_KEY);
  return getForgeUserId();
}

/**
 * Export user data location info
 */
export function getUserDataInfo(): {
  userId: string;
  createdAt: string | null;
  s3Path: string;
} {
  const userId = getForgeUserId();
  return {
    userId,
    createdAt: getForgeUserCreatedAt(),
    s3Path: `${userId}/apps/zen-tot/`,
  };
}
