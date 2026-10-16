import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import {
  BadgeCheck,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Shield,
  Circle,
} from 'lucide-react'

import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user.actions'
import { UserAvatar } from '@/components/shared/user-avatar'
import { isAdminRole } from '@/lib/roles'
import { formatDateTime, formatId } from '@/lib/utils'

import UserEditForm from './user-edit-form'

export const metadata: Metadata = {
  title: 'Edit User',
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-start gap-3'>
      <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-circle bg-primary/10 text-primary'>
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0'>
        <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {label}
        </div>
        <div className='mt-0.5 break-words text-sm font-medium'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default async function UserEditPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params

  const { id } = params

  const user = await getUserById(id)
  if (!user) notFound()

  const session = await auth()
  const canChangeRole = isAdminRole(session?.user?.role)

  const joined = user.createdAt
    ? formatDateTime(new Date(user.createdAt)).dateOnly
    : '—'

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/workspace/users'>Users</Link>
        <span className='mx-1'>›</span>
        <Link href={`/workspace/users/${user._id}`}>{formatId(user._id)}</Link>
      </div>

      <div className='my-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start'>
        {/* Profile details card */}
        <aside className='rounded-2xl border border-border/60 bg-card p-6 '>
          <div className='flex flex-col items-center text-center'>
            <UserAvatar src={user.profile} name={user.name} size={88} />
            <h2 className='mt-4 text-xl font-bold tracking-tight'>
              {user.name}
            </h2>
            <span className='mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary'>
              <Shield className='h-3 w-3' />
              {user.role}
            </span>
          </div>

          <div className='mt-6 space-y-4 border-t border-border/60 pt-5'>
            <DetailRow icon={Mail} label='Email'>
              <span className='flex flex-wrap items-center gap-1.5'>
                {user.email || '—'}
                {user.emailVerified ? (
                  <BadgeCheck className='h-4 w-4 text-green-600' />
                ) : (
                  <Circle className='h-3 w-3 text-muted-foreground/50' />
                )}
              </span>
            </DetailRow>

            <DetailRow icon={Phone} label='Phone'>
              <span className='flex flex-wrap items-center gap-1.5'>
                {user.phone || '—'}
                {user.phone && user.phoneVerified && (
                  <BadgeCheck className='h-4 w-4 text-green-600' />
                )}
              </span>
            </DetailRow>

            <DetailRow icon={CalendarDays} label='Member Since'>
              {joined}
            </DetailRow>

            <DetailRow icon={MapPin} label='Saved Addresses'>
              {user.addresses?.length || 0}
            </DetailRow>
          </div>

          <div className='mt-5 border-t border-border/60 pt-4 text-xs text-muted-foreground'>
            User ID: <span className='font-mono'>{formatId(user._id)}</span>
          </div>
        </aside>

        {/* Edit form */}
        <div className='rounded-2xl border border-border/60 bg-card p-6 '>
          <h2 className='mb-6 text-lg font-bold tracking-tight'>Edit User</h2>
          <UserEditForm user={user} canChangeRole={canChangeRole} />
        </div>
      </div>
    </main>
  )
}
