export const ACCESS_TOKEN_TTL_MS = 10 * 60 * 1000
export const REFRESH_TOKEN_TTL_MS = 15 * 24 * 60 * 60 * 1000
export const JWT_MAX_AGE_SECONDS = 15 * 24 * 60 * 60

const SECURE_SESSION_COOKIE = '__Secure-authjs.session-token'
const SESSION_COOKIE = 'authjs.session-token'

export function getSessionCookieName(isSecure: boolean): string {
  return isSecure ? SECURE_SESSION_COOKIE : SESSION_COOKIE
}

export function getSessionCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: isSecure,
    maxAge: JWT_MAX_AGE_SECONDS,
  }
}

export type TokenExpiry = {
  accessUntil?: number
  refreshUntil?: number
}
