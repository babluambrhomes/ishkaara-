import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  return (
    <StaticPageContent
      title='Privacy Policy'
      content={`<p>We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you interact with our services. By using our platform, you consent to the practices described herein.</p>

<p><strong>Information We Collect</strong> We collect data such as your name, email address, and payment details to provide you with tailored services and improve your experience. This information may also be used for marketing purposes, but only with your consent.</p>

<p><strong>How We Use Your Information</strong> Your information helps us process orders, deliver products, provide customer support, and personalize your shopping experience. We may also use aggregated data to improve our platform and understand customer preferences.</p>

<p><strong>Information Sharing</strong> We may share your data with trusted third-party providers to facilitate transactions or deliver products. We never sell your personal information to third parties.</p>

<p><strong>Data Security</strong> Your data is safeguarded through robust security measures to prevent unauthorized access, alteration, or disclosure.</p>

<p><strong>Your Rights</strong> You have the right to access, correct, or delete your personal information at any time. For inquiries or concerns regarding your privacy, please contact our <a href="/contact-us">support team</a>.</p>`}
    />
  )
}