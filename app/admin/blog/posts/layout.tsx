import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Blog Posts',
}

export default function AdminBlogPostsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
