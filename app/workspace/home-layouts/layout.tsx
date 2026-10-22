import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Home Layouts',
}

export default function WorkspaceHomeLayoutsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
