import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'
import { staticPages } from '@/lib/static-pages'

export const metadata: Metadata = {
  title: 'Returns & Replacements',
}

export default function ReturnsPolicyPage() {
  const page = staticPages['returns-policy']
  return <StaticPageContent title={page.title} content={page.content} />
}