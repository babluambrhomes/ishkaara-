import { User } from 'lucide-react'
import Link from 'next/link'
import CartButton from './cart-button'
import UserButton from './user-button'
import WishlistButton from './wishlist-button'

const Menu = ({ forAdmin = false }: { forAdmin?: boolean }) => {
  return (
    <div className='flex items-center'>
      <nav className='flex items-center gap-2'>
        <div className='hidden md:block'>
          <UserButton />
        </div>
        <Link
          href='/account'
          aria-label='Account'
          className='self-center rounded-full p-2 transition-colors hover:bg-white/10 md:hidden'
        >
          <User className='h-7 w-7' />
        </Link>
        {!forAdmin && <WishlistButton />}
        {!forAdmin && <CartButton />}
      </nav>
    </div>
  )
}

export default Menu