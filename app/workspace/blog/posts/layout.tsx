import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Blog Posts',
}

export default function WorkspaceBlogPostsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
