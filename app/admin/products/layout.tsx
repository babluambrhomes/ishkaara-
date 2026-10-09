import type { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Products',
}

export default function AdminProductsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
