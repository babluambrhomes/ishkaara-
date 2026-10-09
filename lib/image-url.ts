const S3_BASE = (process.env.NEXT_PUBLIC_S3_BASE_URL || '').replace(/\/+$/, '')

/**
 * Turns a stored image value into a renderable URL.
 *
 * - Absolute URLs (legacy UploadThing, external) are returned untouched.
 * - Local public assets (`/images/...`) are returned as-is.
 * - Storage keys (`ishkaara/product/...`) are resolved against the CDN base.
 */
export const getImageUrl = (value?: string | null): string => {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return S3_BASE ? `${S3_BASE}/${trimmed}` : `/${trimmed}`
}

/**
 * Like `getImageUrl`, but guarantees an absolute URL. Required for emails and
 * other contexts where relative paths do not resolve.
 */
export const getAbsoluteImageUrl = (
  value: string | null | undefined,
  origin: string
): string => {
  const url = getImageUrl(value)
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url

  const base = origin.replace(/\/+$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}
