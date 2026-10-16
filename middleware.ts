import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { encode, getToken } from 'next-auth/jwt'
import authConfig from './config/auth.config'
import {
  ACCESS_TOKEN_TTL_MS,
  JWT_MAX_AGE_SECONDS,
  getSessionCookieName,
  getSessionCookieOptions,
} from './lib/auth-token'

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/cart',
  '/cart/(.*)',
  '/wishlist',
  '/product/(.*)',
  '/blog',
  '/blog/(.*)',
  '/about-us',
  '/contact-us',
  '/faq',
  '/help',
  '/terms-and-conditions',
  '/privacy-policy',
  '/returns-policy',
  // (/secret requires auth)
]

const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const publicPathnameRegex = RegExp(
    `^(${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  )
  const { pathname, origin } = req.nextUrl
  const isPublicPage = publicPathnameRegex.test(pathname)

  const secureCookieName = getSessionCookieName(true)
  const cookieName = req.cookies.has(secureCookieName)
    ? secureCookieName
    : getSessionCookieName(false)
  const isSecure = cookieName === secureCookieName

  const signInUrl = () =>
    NextResponse.redirect(
      new URL(
        `/sign-in?callbackUrl=${encodeURIComponent(pathname) || '/'}`,
        origin
      )
    )

  if (!req.auth) {
    return isPublicPage ? NextResponse.next() : signInUrl()
  }

  const token = await getToken({
    req,
    cookieName,
    secret: process.env.AUTH_SECRET,
  })
  if (!token) {
    return isPublicPage ? NextResponse.next() : signInUrl()
  }

  const now = Date.now()
  const accessUntil = token.accessUntil as number | undefined
  const refreshUntil = token.refreshUntil as number | undefined

  if (refreshUntil && now >= refreshUntil) {
    const res = isPublicPage ? NextResponse.next() : signInUrl()
    res.cookies.delete(cookieName)
    return res
  }

  if (accessUntil && now >= accessUntil) {
    const refreshed = await encode({
      token: { ...token, accessUntil: now + ACCESS_TOKEN_TTL_MS },
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
      maxAge: JWT_MAX_AGE_SECONDS,
    })
    const res = NextResponse.next()
    res.cookies.set(cookieName, refreshed, getSessionCookieOptions(isSecure))
    return res
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}