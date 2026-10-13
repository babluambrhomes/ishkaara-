import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Categories',
}

export default function WorkspaceCategoriesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
