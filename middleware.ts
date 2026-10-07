import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from './auth.config'

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
  '/testimonials',
  '/terms-and-conditions',
  '/privacy-policy',
  '/returns-policy',
  // (/secret requires auth)
]

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(${publicPages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  )
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname)

  if (isPublicPage) {
    return NextResponse.next()
  }

  if (!req.auth) {
    const newUrl = new URL(
      `/sign-in?callbackUrl=${
        encodeURIComponent(req.nextUrl.pathname) || '/'
      }`,
      req.nextUrl.origin
    )
    return Response.redirect(newUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}