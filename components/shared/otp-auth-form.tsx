'use client'
import { useState } from 'react'
import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

import useSettingStore from '@/hooks/use-setting-store'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { IUserOtpSend, IUserSignIn } from '@/types'
import { UserOtpSendSchema, UserSignInSchema } from '@/lib/validator'
import { sendOtp, signInWithOtp } from '@/lib/actions/user.actions'

function TermsNotice() {
  const {
    setting: { site },
  } = useSettingStore()
  return (
    <div className='text-sm'>
      By signing in, you agree to {site.name}&apos;s{' '}
      <Link className='underline hover:text-primary' href='/terms-and-conditions'>
        Conditions of Use </Link>
      and {'  '}
      <Link className='underline hover:text-primary' href='/privacy-policy'>
        Privacy Notice
      </Link>
    </div>
  )
}

function PhoneStep({ onSubmitted }: { onSubmitted: (phone: string, otp: string) => void }) {
  const form = useForm<IUserOtpSend>({
    resolver: zodResolver(UserOtpSendSchema),
    defaultValues: {
      phone: '',
    },
  })

  const { handleSubmit, control } = form

  const onSubmit = async (data: IUserOtpSend) => {
    try {
      const res = await sendOtp({ phone: data.phone })

      if (!res.success) {
        toast({
          title: 'Error',
          description: res.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'OTP sent',
        description: 'Use the OTP to continue.',
      })
      onSubmitted(data.phone, res.otp)
    } catch (error) {
      if (isRedirectError(error)) throw error
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <FormField
            control={control}
            name='phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type='tel'
                    placeholder='Enter phone number'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type='submit'>Send OTP</Button>
          </div>
          <TermsNotice />
        </div>
      </form>
    </Form>
  )
}

function OtpStep({
  phone,
  sentOtp,
  callbackUrl,
  onResend,
}: {
  phone: string
  sentOtp: string
  callbackUrl: string
  onResend: () => void
}) {
  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: {
      phone,
      otp: '',
    },
  })

  const { handleSubmit, control } = form

  const onSubmit = async (data: IUserSignIn) => {
    try {
      await signInWithOtp({ phone: data.phone, otp: data.otp })
      window.location.href = callbackUrl
    } catch (error) {
      if (isRedirectError(error)) throw error
      toast({
        title: 'Error',
        description: 'Invalid or expired OTP',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-6'>
          <div className='rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm'>
            <p className='font-medium'>Verification code sent to {phone}</p>
            <p className='mt-1 text-muted-foreground'>
              Demo OTP: <span className='font-semibold'>{sentOtp}</span>
            </p>
          </div>
          <FormField
            control={control}
            name='otp'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input
                    inputMode='numeric'
                    maxLength={6}
                    placeholder='Enter 6 digit OTP'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type='submit'>Verify &amp; Sign In</Button>
          </div>
          <div className='text-sm'>
            Didn&apos;t receive it?{' '}
            <button type='button' className='link' onClick={onResend}>
              Resend OTP
            </button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default function OtpAuthForm({ callbackUrl }: { callbackUrl: string }) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [sentOtp, setSentOtp] = useState('')

  if (step === 'otp') {
    return (
      <OtpStep
        phone={phone}
        sentOtp={sentOtp}
        callbackUrl={callbackUrl}
        onResend={() => setStep('phone')}
      />
    )
  }

  return (
    <PhoneStep
      onSubmitted={(p, otp) => {
        setPhone(p)
        setSentOtp(otp)
        setStep('otp')
      }}
    />
  )
}