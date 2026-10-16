'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import useScrollDirection from '@/hooks/use-scroll-direction'

export default function MobileSearch({ children }: { children: ReactNode }) {
  const { direction, isAtTop } = useScrollDirection()
  const hidden = direction === 'down' && !isAtTop

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        hidden
          ? 'max-h-0 -translate-y-2 opacity-0 pb-0 pointer-events-none'
          : 'max-h-24 translate-y-0 opacity-100 pb-2'
      )}
    >
      {children}
    </div>
  )
}
