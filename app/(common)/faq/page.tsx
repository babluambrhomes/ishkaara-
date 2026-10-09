import { Metadata } from 'next'
import { getPublicFaqs } from '@/lib/actions/faq.actions'
import FaqClient from './faq-client'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description:
    'Find answers to common questions about orders, shipping, payment methods, returns, and customer service.',
}

export default async function FaqPage() {
  const faqs = await getPublicFaqs()

  return <FaqClient initialFaqs={faqs} />
}