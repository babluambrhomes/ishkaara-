import { auth } from '@/auth'
import Link from 'next/link'

export default async function UserButton() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return (
      <Link
        href='/sign-in'
        className='flex flex-col text-xs text-left transition-colors hover:opacity-80'
      >
        <span className='font-semibold text-[14px]'>Hello, Sign in</span>
      </Link>
    )
  }

  return (
    <Link
      href='/account'
      className='flex flex-col text-xs text-left transition-colors hover:opacity-80'
    >
      <span className='font-semibold text-[14px]'>Hello, {user.name}</span>
      <span className='hidden md:block text-xs text-muted-foreground'>
        Your Account
      </span>
    </Link>
  )
}