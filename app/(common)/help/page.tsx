import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'
import { staticPages } from '@/lib/static-pages'

export const metadata: Metadata = {
  title: 'Help Center',
}

export default function HelpPage() {
  const page = staticPages.help
  return <StaticPageContent title={page.title} content={page.content} />
}