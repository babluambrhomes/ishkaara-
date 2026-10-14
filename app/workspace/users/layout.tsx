import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import { isStaffRole } from '@/lib/roles'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default async function AdminUsersLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!isStaffRole(session?.user?.role)) notFound()

  return <>{children}</>
}
