import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default function AdminUsersLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
