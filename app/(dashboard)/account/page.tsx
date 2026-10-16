import BrowsingHistory from '@/components/shared/browsing-history'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { auth } from '@/auth'
import { SignOut, getUserById } from '@/lib/actions/user.actions'
import { isAdminRole, isStaffRole } from '@/lib/roles'
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  PackageCheckIcon,
  Pencil,
  ShieldCheck,
  Smartphone,
  Tags,
  User,
  Users,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

const PAGE_TITLE = 'Your Account'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function AccountPage() {
  const session = await auth()
  const isStaff = isStaffRole(session?.user.role)
  const isAdmin = isAdminRole(session?.user.role)
  let user: Awaited<ReturnType<typeof getUserById>> | null = null
  if (session?.user?.id) {
    try {
      user = await getUserById(session.user.id)
    } catch {
      user = null
    }
  }

  const accountLinks = [
    {
      href: '/account/orders',
      icon: PackageCheckIcon,
      title: 'Orders',
      desc: 'Track, return, cancel an order or buy again',
    },
    {
      href: '/wishlist',
      icon: Heart,
      title: 'Wishlist',
      desc: 'View the products you saved for later',
    },
    {
      href: '/account/profile',
      icon: User,
      title: 'Profile & security',
      desc: 'Manage email and mobile number',
    },
    {
      href: '/account/addresses',
      icon: Home,
      title: 'Addresses',
      desc: 'Edit, remove or set your default address',
    },
  ]

  const workspaceLinks = [
    { href: '/workspace/overview', icon: LayoutDashboard, label: 'Overview' },
    { href: '/workspace/orders', icon: Package, label: 'Orders' },
    { href: '/workspace/products', icon: Tags, label: 'Products' },
    { href: '/workspace/blog/posts', icon: FileText, label: 'Blog' },
    ...(isAdmin
      ? [{ href: '/workspace/users', icon: Users, label: 'Users' }]
      : []),
  ]

  return (
    <div className='mx-auto px-3 py-8'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <div>
          <div className='mb-2'>
            <h1 className='text-3xl font-bold tracking-tight'>{PAGE_TITLE}</h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            {user?.name
              ? `Welcome back, ${user.name}`
              : session?.user?.name
                ? `Welcome back, ${session.user.name}`
                : 'Manage your orders, wishlist and account settings'}
          </p>
        </div>
      {isStaff && (
          <Link
            href='/workspace/overview'
            className='inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground  transition-all '
          >
            <ShieldCheck className='h-4 w-4' />
            Workspace
          </Link>
        )}
      </div>

      {session?.user && (
        <Card className='mb-8 overflow-hidden rounded-3xl border-border/60 bg-white '>
          <div className='h-14 bg-gradient-to-r from-primary via-[#344c35] to-gold' />
          <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 pb-6 pt-0'>
            <div className='flex items-center gap-4'>
              <span className='-mt-7 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-background bg-white text-2xl font-bold text-primary '>
                {(user?.name || session.user.name || 'U').charAt(0).toUpperCase()}
              </span>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='text-xl font-bold tracking-tight'>
                    {user?.name || session.user.name}
                  </h2>
                  {isStaff && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gold'>
                      <BadgeCheck className='h-3 w-3' />
                      {session.user.role}
                    </span>
                  )}
                </div>
                <div className='mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4'>
                  <span className='flex items-center gap-1.5'>
                    <Mail className='h-3.5 w-3.5' />
                    {user?.email || session.user.email || 'No email set'}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <Smartphone className='h-3.5 w-3.5' />
                    {user?.phone || session.user.phone || 'No phone linked'}
                  </span>
                </div>
              </div>
            </div>
            <Button
              asChild
              variant='outline'
              className='h-10 rounded-full border-primary/30 px-5 text-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Link href='/account/profile'>
                <Pencil className='h-4 w-4' />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {accountLinks.map(({ href, icon: Icon, title, desc }) => (
          <Link key={title} href={href} className='group'>
            <Card className='h-full overflow-hidden rounded-3xl border-border/60 bg-white transition-all group-hover:-translate-y-1 group-hover:border-primary/30 '>
              <CardContent className='flex h-full flex-col items-start gap-4 p-1 sm:p-6'>
                <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-gold text-white '>
                  <Icon className='h-6 w-6' />
                </span>
                <div>
                  <h2 className='text-lg font-bold tracking-tight'>{title}</h2>
                  <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                    {desc}
                  </p>
                </div>
                <span className='mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary'>
                  Open
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {isStaff && (
        <section className='mt-8 rounded-3xl border border-border/60 bg-white p-6 '>
          <div className='mb-4 flex items-center gap-3'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary'>
              <ShieldCheck className='h-5 w-5' />
            </span>
            <div>
              <h2 className='font-bold tracking-tight'>Workspace</h2>
              <p className='text-xs text-muted-foreground'>
                Manage your store
              </p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2.5'>
            {workspaceLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                className='inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
              >
                <Icon className='h-4 w-4' />
                {label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {session?.user && (
        <section className='mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-dashed border-border bg-white px-6 py-5'>
          <div>
            <p className='text-sm'>
              Signed in as{' '}
              <span className='font-semibold text-foreground'>
                {session.user.name}
              </span>
            </p>
            <p className='text-xs text-muted-foreground'>{session.user.email}</p>
          </div>
          <form action={SignOut}>
            <Button
              type='submit'
              variant='outline'
              className='h-10 rounded-full border-destructive/30 px-5 text-sm font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive'
            >
              <LogOut className='h-4 w-4' />
              Logout
            </Button>
          </form>
        </section>
      )}

      <BrowsingHistory className='mt-16' />
    </div>
  )
}