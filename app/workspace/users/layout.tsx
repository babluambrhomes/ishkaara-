import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import { isAdminRole } from '@/lib/roles'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default async function AdminUsersLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!isAdminRole(session?.user?.role)) notFound()

  return <>{children}</>
}
