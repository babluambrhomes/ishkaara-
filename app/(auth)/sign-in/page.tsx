import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import OtpAuthForm from '@/components/shared/otp-auth-form'
import { GoogleSignInForm } from './google-signin-form'
import Image from 'next/image'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams

  const { callbackUrl = '/' } = searchParams

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }

  const { site } = await getSetting()

  return (
    <div className='mx-auto w-full max-w-md p-4 md:py-10'>
 <div className='w-full'>
      <Card>
        <CardHeader>
         <Image
                  src={site.logoGreen}
                  alt={`${site.name} logo`}
                  width={100}
                  height={100}
                  className='mx-auto'
                  
                />
        </CardHeader>
        <CardContent>
          <div>
            <OtpAuthForm callbackUrl={callbackUrl} />
            <SeparatorWithOr />
            <div className='mt-4'>
              <GoogleSignInForm />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
   
  )
}