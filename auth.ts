import { MongoDBAdapter } from '@auth/mongodb-adapter'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import client from './lib/db/client'
import User from './lib/db/models/user.model'

import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from './auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
      phone?: string | null
      phoneVerified?: boolean
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      credentials: {
        phone: {
          type: 'text',
        },
        otp: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (credentials == null) return null

        const user = await User.findOne({ phone: credentials.phone })

        if (user && user.otp && user.otp === credentials.otp) {
          user.otp = null
          user.phoneVerified = true
          await user.save()
          return {
            id: user._id,
            name: user.name,
            email: user.email || undefined,
            phone: user.phone,
            phoneVerified: true,
            role: user.role,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session, account }) => {
      if (user) {
        await connectToDatabase()
        let dbUser = await User.findById(user.id)
        if (!dbUser && user.email) dbUser = await User.findOne({ email: user.email })

        if (account?.provider === 'google' && dbUser && !dbUser.emailVerified) {
          dbUser.emailVerified = true
          await dbUser.save()
        }

        const name =
          dbUser?.name ||
          user.name ||
          user.email?.split('@')[0] ||
          'Hi User'
        if (!dbUser?.name) {
          await User.findByIdAndUpdate(user.id, {
            name,
            role: (user as { role?: string }).role || 'User',
          })
        }
        token.name = name
        token.role = dbUser?.role || (user as { role?: string }).role || 'User'
        token.phone = dbUser?.phone ?? null
        token.phoneVerified = dbUser?.phoneVerified ?? false
      }

      if (trigger === 'update') {
        const patch = (
          session?.user && Object.keys(session.user).length > 0
            ? session.user
            : session
        ) as {
          name?: string
          email?: string
          phone?: string | null
          phoneVerified?: boolean
        } | null
        if (patch?.name) token.name = patch.name
        if (patch?.email) token.email = patch.email
        if (patch?.phone !== undefined) token.phone = patch.phone
        if (patch?.phoneVerified !== undefined)
          token.phoneVerified = patch.phoneVerified
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user.id = token.sub as string
      session.user.role = token.role as string
      session.user.name = token.name as string
      session.user.email = (token.email as string | null | undefined) ?? ''
      session.user.phone = token.phone as string | null
      session.user.phoneVerified = (token.phoneVerified as boolean) ?? false
      return session
    },
  },
})