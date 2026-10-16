'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import {
  LayoutDashboard,
  Tags,
  FolderTree,
  FileText,
  Package,
  Users,
  LogOut,
  PanelLeft,
  MenuIcon,
  MessageSquare,
  Mail,
  HelpCircle,
  Ticket,
  Images,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { SignOut } from '@/lib/actions/user.actions'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const links = [
  { title: 'Overview', href: '/workspace/overview', icon: LayoutDashboard },
  { title: 'Products', href: '/workspace/products', icon: Tags },
  { title: 'Categories', href: '/workspace/categories', icon: FolderTree },
  { title: 'Home Banners', href: '/workspace/home-banners', icon: Images },
  { title: 'Blog', href: '/workspace/blog/posts', icon: FileText },
  { title: 'Orders', href: '/workspace/orders', icon: Package },
  { title: 'Users', href: '/workspace/users', icon: Users },
  { title: 'Messages', href: '/workspace/messages', icon: MessageSquare },
  { title: 'Newsletter', href: '/workspace/newsletter', icon: Mail },
  { title: 'Coupons', href: '/workspace/coupons', icon: Ticket },
  { title: 'FAQs', href: '/workspace/faqs', icon: HelpCircle },
]

function NavLinks({
  navLinks,
  collapsed = false,
  onNavigate,
}: {
  navLinks: typeof links
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <nav className='flex flex-col gap-1'>
      {navLinks.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.title : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-white/10 font-semibold text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
              collapsed && 'justify-center px-0'
            )}
          >
            <Icon className='h-4 w-4 shrink-0' />
            {!collapsed && item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export function WorkspaceShell({
  siteLogo,
  menu,
  children,
}: {
  siteLogo: string
  menu: React.ReactNode
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleLinks = links

  return (
    <div className='flex min-h-screen bg-background'>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col bg-black text-white transition-[width] duration-200 md:flex',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <div className='flex h-16 items-center overflow-hidden border-b border-white/10 px-4'>
          {!collapsed && (
            <Link
              href='/'
              className='flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80'
            >
              <Image
                src={siteLogo}
                width={82}
                height={36}
                alt='Site logo'
                className='h-9 w-auto shrink-0 rounded-lg object-contain'
              />
            </Link>
          )}
        </div>
        <div className='flex-1 overflow-y-auto p-3'>
          <NavLinks navLinks={visibleLinks} collapsed={collapsed} />
        </div>
      </aside>

      <div
        className={cn(
          'flex flex-1 flex-col transition-[padding] duration-200',
          collapsed ? 'md:pl-[76px]' : 'md:pl-64'
        )}
      >
        <header className='sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-black px-2 text-white sm:gap-3 sm:px-4'>
          <button
            type='button'
            onClick={() => setCollapsed((value) => !value)}
            aria-label='Toggle sidebar'
            className='hidden rounded-full p-2 transition-colors hover:bg-white/10 md:flex'
          >
            <PanelLeft className='h-5 w-5' />
          </button>

          <div className='md:hidden'>
            <Drawer
              direction='left'
              open={mobileOpen}
              onOpenChange={setMobileOpen}
            >
              <DrawerTrigger
                aria-label='Open workspace menu'
                className='rounded-full p-2 transition-colors hover:bg-white/10'
              >
                <MenuIcon className='h-6 w-6' />
              </DrawerTrigger>
              <DrawerContent className='top-0 mt-0 h-full w-[280px] rounded-none border-white/10 bg-black text-white'>
                <div className='flex min-h-0 flex-1 flex-col'>
                  <DrawerHeader className='border-b border-white/10 text-left'>
                    <DrawerTitle className='text-lg font-bold tracking-tight'>
                      Workspace
                    </DrawerTitle>
                    <DrawerDescription className='text-white/60'>
                      Workspace navigation
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 overflow-y-auto p-3'>
                    <NavLinks
                      navLinks={visibleLinks}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <Link
            href='/'
            className='flex items-center gap-2 transition-opacity hover:opacity-80 md:hidden'
          >
            <Image
              src={siteLogo}
              width={90}
              height={40}
              alt='Site logo'
              className='h-12 w-auto object-contain'
            />
          </Link>

          <div className='ml-auto flex items-center gap-1 sm:gap-2'>
            <form action={SignOut}>
              <button
                type='submit'
                className='flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white'
              >
                <LogOut className='h-4 w-4' />
                <span className='hidden sm:inline'>Logout</span>
              </button>
            </form>
            {menu}
          </div>
        </header>
        <main className='flex-1 p-4'>{children}</main>
      </div>
    </div>
  )
}
