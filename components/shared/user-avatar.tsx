import Image from 'next/image'
import { getImageUrl } from '@/lib/image-url'
import { cn } from '@/lib/utils'

export function UserAvatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null
  name?: string
  size?: number
  className?: string
}) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()

  if (src) {
    return (
      <Image
        src={getImageUrl(src)}
        alt={name || 'User'}
        width={size}
        height={size}
        unoptimized
        className={cn('shrink-0 rounded-circle object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-circle bg-primary/10 font-bold text-primary',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size / 2.4) }}
      aria-label={name || 'User'}
    >
      {initial}
    </span>
  )
}
