import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'
import { staticPages } from '@/lib/static-pages'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  const page = staticPages['privacy-policy']
  return <StaticPageContent title={page.title} content={page.content} />
}