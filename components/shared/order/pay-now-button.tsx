'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import useSettingStore from '@/hooks/use-setting-store'
import { startRazorpayCheckout } from '@/lib/razorpay-client'

export default function PayNowButton({
  orderId,
  prefill,
  label = 'Pay Now',
  className,
  successRedirect,
  failureRedirect,
}: {
  orderId: string
  prefill?: { name?: string; email?: string; contact?: string }
  label?: string
  className?: string
  successRedirect?: string
  failureRedirect?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const {
    setting: { site },
  } = useSettingStore()
  const [isPaying, setIsPaying] = useState(false)

  const handlePay = async () => {
    setIsPaying(true)
    await startRazorpayCheckout({
      orderId,
      siteName: site?.name || 'Lemon Fashion',
      description: `Order #${orderId}`,
      prefill,
      onSuccess: () => {
        setIsPaying(false)
        if (successRedirect) router.push(successRedirect)
        else router.refresh()
      },
      onFailure: (reason) => {
        setIsPaying(false)
        toast({ description: reason, variant: 'destructive' })
        if (failureRedirect) router.push(failureRedirect)
      },
    })
  }

  return (
    <Button
      onClick={handlePay}
      disabled={isPaying}
      className={className}
    >
      {isPaying ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <CreditCard className='h-4 w-4' />
      )}
      {isPaying ? 'Processing…' : label}
    </Button>
  )
}
