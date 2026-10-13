import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Products',
}

export default function WorkspaceProductsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
