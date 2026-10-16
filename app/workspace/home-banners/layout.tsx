import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace Home Banners',
}

export default function WorkspaceHomeBannersLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
