import { Resend } from 'resend'
import { SENDER_EMAIL, SENDER_NAME } from '@/config/data'

export const sender = {
  name: SENDER_NAME,
  email: SENDER_EMAIL,
}

let resend: Resend | undefined

export const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set. Add it to your environment to send emails.'
    )
  }
  resend ??= new Resend(apiKey)
  return resend
}
