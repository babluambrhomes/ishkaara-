import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Categories',
}

export default function AdminCategoriesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
