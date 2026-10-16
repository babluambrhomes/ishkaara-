import * as React from 'react'
import Link from 'next/link'
import { X, ChevronRight, UserCircle, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/lib/actions/user.actions'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { auth } from '@/auth'
import { ICategory } from '@/lib/models/category.model'

export default async function Sidebar({
  categories,
}: {
  categories: ICategory[]
}) {
  const session = await auth()
  const user = session?.user

  return (
    <Drawer direction='left'>
      <DrawerTrigger className='my-2 flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground  transition-all duration-200 hover:bg-muted active:scale-95'>
        <MenuIcon className='h-5 w-5' />
        All
      </DrawerTrigger>
      <DrawerContent className='w-[350px] mt-0 top-0 rounded-none'>
        <div className='flex flex-col h-full'>
          {/* User Sign In Section */}
          <div className='bg-gradient-to-b rounded-none from-[#344c35] to-[#243526] text-white flex items-center justify-between  '>
            <DrawerHeader>
              <DrawerTitle className='flex items-center'>
                <UserCircle className='h-6 w-6 mr-2' />
                {user ? (
                  <DrawerClose asChild>
                    <Link href='/account'>
                      <span className='text-lg font-semibold'>
                        Hello, {user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href='/sign-in'>
                      <span className='text-lg font-semibold'>
                        Hello, sign in
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant='ghost' size='icon' className='mr-2'>
                <X className='h-5 w-5' />
                <span className='sr-only'>Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Shop By Category */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-4 border-b border-border/70'>
              <h2 className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>
                Shop By Department
              </h2>
            </div>
            <nav className='flex flex-col'>
              {categories.map((category) => (
                <DrawerClose asChild key={category._id}>
                  <Link
                    href={`/search?category=${encodeURIComponent(category.name)}`}
                    className='group flex items-center justify-between item-button transition-colors'
                  >
                    <span>{category.name}</span>
                    <ChevronRight className='h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* Setting and Help */}
          <div className='border-t flex flex-col '>
            <div className='p-4'>
              <h2 className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>
                Help & Settings
              </h2>
            </div>
            <DrawerClose asChild>
              <Link href='/account' className='item-button'>
                Your account
              </Link>
            </DrawerClose>{' '}
            <DrawerClose asChild>
              <Link href='/help' className='item-button'>
                Help Center
              </Link>
            </DrawerClose>
            {user ? (
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full justify-start item-button text-base'
                  variant='ghost'
                >
                  Sign out
                </Button>
              </form>
            ) : (
              <Link href='/sign-in' className='item-button'>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
