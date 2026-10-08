import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/auth'
import { getUserAddresses } from '@/lib/actions/address.actions'
import AddressesManager from './addresses-manager'

export const metadata: Metadata = {
  title: 'My Addresses',
}

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in?callbackUrl=/account/addresses')
  }

  const { data: addresses } = await getUserAddresses()

  return (
    <div className='mx-auto max-w-5xl px-3 py-8'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <div>
          <div className='mb-2'>
            <h1 className='text-3xl font-bold tracking-tight'>My Addresses</h1>
          </div>
          
        </div>
        <Link
          href='/account'
          className='inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:border-primary/30 hover:text-primary'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Account
        </Link>
      </div>

      <AddressesManager addresses={addresses} defaultPhone={session.user.phone || ''} />
    </div>
  )
}