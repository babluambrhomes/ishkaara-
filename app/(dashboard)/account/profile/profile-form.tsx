'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  initiateGoogleAttach,
  sendPhoneVerificationOtp,
  updateProfile,
  verifyPhoneLink,
} from '@/lib/actions/user.actions'
import { ImageUpload } from '@/components/shared/image-upload'
import { UserProfileUpdateSchema } from '@/lib/validator'
import { BadgeCheck, Mail, ShieldX, Smartphone } from 'lucide-react'

type AddPhoneStepValues = {
  phone: string
}

type AddOtpStepValues = {
  otp: string
}

function AddPhoneFlow() {
  const router = useRouter()
  const { toast } = useToast()
  const { update } = useSession()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [sentOtp, setSentOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const phoneForm = useForm<AddPhoneStepValues>({
    defaultValues: { phone: '' },
  })

  const otpForm = useForm<AddOtpStepValues>({
    defaultValues: { otp: '' },
  })

  const sendOtp = async (data: AddPhoneStepValues) => {
    const trimmed = data.phone.trim()
    if (!trimmed) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    const res = await sendPhoneVerificationOtp(trimmed)
    setSubmitting(false)
    if (!res.success) {
      toast({ title: 'Error', description: res.message, variant: 'destructive' })
      return
    }
    setSentOtp(res.otp || '')
    setStep('otp')
    toast({ title: 'OTP sent', description: 'Use the OTP to verify your phone.' })
  }

  const verify = async (data: AddOtpStepValues) => {
    if (data.otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Enter the 6 digit OTP',
        variant: 'destructive',
      })
      return
    }
    const currentPhone = phoneForm.getValues('phone').trim()
    setSubmitting(true)
    const res = await verifyPhoneLink({ phone: currentPhone, otp: data.otp })
    setSubmitting(false)
    if (!res.success) {
      toast({ title: 'Error', description: res.message, variant: 'destructive' })
      return
    }
    await update({ phone: currentPhone, phoneVerified: true })
    toast({ description: res.message })
    router.refresh()
  }

  return (
    <div className='rounded-2xl border border-gold/30 bg-gradient-to-br from-[#f4f4f5] via-background to-[#e4e4e7] p-4 sm:p-5'>
      <div className='flex items-center gap-2'>
        <Smartphone className='h-4 w-4 text-gold' />
        <p className='text-sm font-bold text-foreground'>
          Add phone number
        </p>
      </div>
      <p className='mt-1 text-xs text-muted-foreground'>
        Link and verify your mobile number to secure your account.
      </p>

      <div className='mt-4 space-y-3'>
        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(sendOtp)} className='space-y-3'>
            <Input
              type='tel'
              inputMode='tel'
              placeholder='Enter phone number'
              {...phoneForm.register('phone')}
            />
            <Button
              type='submit'
              disabled={submitting}
              className='h-10 rounded-full px-6'
            >
              {submitting ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(verify)} className='space-y-3'>
            <div className='rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm'>
              <p className='font-medium'>Verification code sent to {phoneForm.watch('phone')}</p>
              <p className='mt-1 text-muted-foreground'>
                Demo OTP: <span className='font-semibold'>{sentOtp}</span>
              </p>
            </div>
            <Input
              inputMode='numeric'
              maxLength={6}
              placeholder='Enter 6 digit OTP'
              {...otpForm.register('otp')}
            />
            <div className='flex flex-wrap items-center gap-3'>
              <Button
                type='submit'
                disabled={submitting}
                className='h-10 rounded-full px-6'
              >
                {submitting ? 'Verifying...' : 'Verify & Link'}
              </Button>
              <button
                type='button'
                className='text-sm font-medium text-primary hover:underline'
                onClick={() => setStep('phone')}
              >
                Change number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ProfileForm({
  name,
  profile,
  email,
  emailVerified,
  phone,
  phoneVerified,
  attachError,
}: {
  name: string
  profile: string
  email: string
  emailVerified: boolean
  phone: string
  phoneVerified: boolean
  attachError: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { update } = useSession()
  const [profileImage, setProfileImage] = useState(profile || '')

  const form = useForm<z.infer<typeof UserProfileUpdateSchema>>({
    resolver: zodResolver(UserProfileUpdateSchema.pick({ name: true })),
    defaultValues: {
      name: name || '',
    },
  })

  const onProfileSubmit = async (values: z.infer<typeof UserProfileUpdateSchema>) => {
    const res = await updateProfile({ name: values.name, profile: profileImage })
    if (!res.success) {
      toast({ variant: 'destructive', description: res.message })
      return
    }
    await update({ name: values.name })
    toast({ description: res.message })
    router.refresh()
  }

  const needsPhone = !phone || !phoneVerified
  const needsEmailLink = phoneVerified && !email

  return (
    <div className='space-y-6'>
      {attachError && (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
          {attachError}
        </div>
      )}

      <Card className='rounded-3xl border-border/60 bg-white '>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              method='post'
              onSubmit={form.handleSubmit(onProfileSubmit)}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Profile photo</p>
                <ImageUpload
                  value={profileImage}
                  onChange={setProfileImage}
                  entity='user'
                  label='Upload photo'
                />
              </div>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Your name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-wrap gap-3 pt-2'>
                <Button
                  type='submit'
                  disabled={form.formState.isSubmitting}
                  className='h-10 rounded-full px-6'
                >
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='h-10 rounded-full px-6'
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className='rounded-3xl border-border/60 bg-white '>
        <CardContent className='space-y-5 p-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-circle bg-primary/5 text-primary'>
                <Mail className='h-4 w-4' />
              </span>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Email
                </p>
                <p className='mt-0.5 text-sm font-semibold text-foreground'>
                  {email || 'No email linked'}
                </p>
              </div>
            </div>
            {email ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  emailVerified
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {emailVerified ? (
                  <BadgeCheck className='h-3.5 w-3.5' />
                ) : (
                  <ShieldX className='h-3.5 w-3.5' />
                )}
                {emailVerified ? 'Verified' : 'Not verified'}
              </span>
            ) : (
              <span className='rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground'>
                Not linked
              </span>
            )}
          </div>

          {needsEmailLink && (
            <form action={initiateGoogleAttach}>
              <div className='rounded-2xl border border-gold/30 bg-gradient-to-br from-[#f4f4f5] via-background to-[#e4e4e7] p-4 sm:p-5'>
                <p className='text-sm font-bold text-foreground'>
                  Verify email with Google
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Connect your Google account to add and verify your email.
                </p>
                <Button
                  type='submit'
                  className='mt-3 h-10 rounded-full px-5'
                >
                  Connect Google
                </Button>
              </div>
            </form>
          )}

          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5'>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-circle bg-primary/5 text-primary'>
                <Smartphone className='h-4 w-4' />
              </span>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  Account mobile number
                </p>
                <p className='mt-0.5 text-sm font-semibold text-foreground'>
                  {phone || 'No phone linked'}
                </p>
              </div>
            </div>
            {phoneVerified ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600'>
                <BadgeCheck className='h-3.5 w-3.5' />
                Verified
              </span>
            ) : (
              <span className='inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600'>
                <ShieldX className='h-3.5 w-3.5' />
                Not verified
              </span>
            )}
          </div>

          {needsPhone && <AddPhoneFlow />}
        </CardContent>
      </Card>
    </div>
  )
}
