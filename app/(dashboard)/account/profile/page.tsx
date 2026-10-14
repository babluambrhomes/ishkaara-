import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

import { auth } from '@/auth'
import {
  completeGoogleAttach,
  getUserById,
} from '@/lib/actions/user.actions'
import ProfileForm from './profile-form'

export const metadata: Metadata = {
  title: 'Edit Profile',
}

export default async function ProfilePage(props: {
  searchParams: Promise<{ googleAttached?: string }>
}) {
  const searchParams = await props.searchParams
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/account/profile')
  }

  let attachError: string | null = null
  if (searchParams.googleAttached) {
    const res = await completeGoogleAttach()
    if (res && !res.success) attachError = res.message
  }

  const user = await getUserById(session.user.id)
  if (!user) notFound()

  return (
    <div className='mx-auto max-w-2xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Edit Profile</h1>
      </div>
      <SessionProvider>
        <ProfileForm
          name={user.name}
          profile={user.profile || ''}
          email={user.email || ''}
          emailVerified={!!user.emailVerified}
          phone={user.phone || ''}
          phoneVerified={!!user.phoneVerified}
          attachError={attachError}
        />
      </SessionProvider>
    </div>
  )
}