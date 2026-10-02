/** Supabase Auth e-posta alanı; kullanıcı arayüzünde yalnızca username gösterilir. */
export const AUTH_USERNAME_EMAIL_DOMAIN = 'users.planly.app';

export function normalizeUsername(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase();
}

export function validateUsername(username) {
  const u = normalizeUsername(username);
  if (u.length < 3) return 'short';
  if (u.length > 24) return 'long';
  if (!/^[a-z0-9._-]+$/.test(u)) return 'invalid';
  return null;
}

export function usernameToAuthEmail(username) {
  const u = normalizeUsername(username);
  return `${u}@${AUTH_USERNAME_EMAIL_DOMAIN}`;
}

export function usernameFromAuthUser(user) {
  if (!user) return null;
  const meta = user.user_metadata?.username;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  const suffix = `@${AUTH_USERNAME_EMAIL_DOMAIN}`;
  if (email.endsWith(suffix)) {
    return email.slice(0, -suffix.length) || null;
  }
  return null;
}

export function isRegisteredAuthUser(user) {
  if (!user || user.is_anonymous === true) return false;
  return Boolean(usernameFromAuthUser(user) || user.email);
}
