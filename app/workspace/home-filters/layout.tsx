import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Home Filters',
}

export default function WorkspaceHomeFiltersLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
