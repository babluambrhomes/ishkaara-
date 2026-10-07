import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'
import { staticPages } from '@/lib/static-pages'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
}

export default function TermsConditionsPage() {
  const page = staticPages['terms-and-conditions']
  return <StaticPageContent title={page.title} content={page.content} />
}