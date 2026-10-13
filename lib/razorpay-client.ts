import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '@/lib/actions/order.actions'

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
const BRAND_COLOR = '#880101'

let scriptPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export async function startRazorpayCheckout({
  orderId,
  siteName,
  description,
  prefill,
  onSuccess,
  onFailure,
}: {
  orderId: string
  siteName: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  onSuccess: () => void
  onFailure?: (reason: string) => void
}): Promise<void> {
  const created = await createRazorpayOrder(orderId)
  if (!created.success || !('data' in created) || !created.data) {
    onFailure?.(created.message)
    return
  }

  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Unable to load the payment gateway. Please try again.')
    return
  }

  const { id, amount, currency, keyId } = created.data

  const razorpay = new window.Razorpay({
    key: keyId,
    amount,
    currency,
    name: siteName,
    description: description ?? `Order #${orderId}`,
    order_id: id,
    prefill,
    theme: { color: BRAND_COLOR },
    handler: async (response: RazorpaySuccessResponse) => {
      const verified = await verifyRazorpayPayment({
        orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })
      if (verified.success) {
        onSuccess()
      } else {
        onFailure?.(verified.message)
      }
    },
    modal: {
      ondismiss: () => onFailure?.('Payment was cancelled.'),
    },
  })

  razorpay.on('payment.failed', () => {
    onFailure?.('Payment failed. Please try again.')
  })

  razorpay.open()
}
