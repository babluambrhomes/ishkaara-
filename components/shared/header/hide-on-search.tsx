'use client'

import { usePathname } from 'next/navigation'

export default function HideOnSearch({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  if (pathname === '/search') return null
  return <>{children}</>
}
