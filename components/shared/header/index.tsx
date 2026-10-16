import Image from 'next/image'
import Link from 'next/link'
import { getAllCategories } from '@/lib/actions/product.actions'
import Menu from './menu'
import Search from './search'
import data from '@/config/data'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'

export default async function Header() {
  const categories = await getAllCategories()
  const { site } = await getSetting()
  return (
    <header className='sticky top-0 z-50 bg-white text-foreground shadow-md'>
      <div className='bg-white border-b border-border'>
        <div className='px-2 py-2'>
          <div className='flex items-center justify-between gap-3'>
            {/* Left: mobile categories trigger + logo + desktop menus */}
            <div className='flex items-center gap-2'>
              <div className='md:hidden'>
                <Sidebar categories={categories} />
              </div>
              <Link
                href='/'
                className='flex items-center font-extrabold text-2xl m-1 display-inline-block'
              >
                <Image
                  src={site.logoGreen}
                  className='w-full h-auto max-w-[120px] '
                  width={66}
                  height={30}
                  alt={`${site.name} logo`}
                />
              </Link>
              <div className='hidden xl:flex items-center gap-1 ml-2'>
                <Sidebar categories={categories} />
                {data.headerMenus.map((menu) => (
                  <Link
                    href={menu.href}
                    key={menu.href}
                    className='px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-primary'
                  >
                    {menu.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center: search */}
            <div className='hidden md:block flex-1 max-w-xl'>
              <Search />
            </div>

            {/* Right: user / wishlist / cart icons */}
            <Menu />
          </div>
        </div>
        {/* Mobile search */}
        <div className='md:hidden px-2 pb-2'>
          <Search />
        </div>
      </div>
    </header>
  )
}