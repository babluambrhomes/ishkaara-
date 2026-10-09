import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
}

export default function TermsConditionsPage() {
  return (
    <StaticPageContent
      title='Terms & Conditions'
      content={`<p>Welcome to <strong>Ishkaara</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our platform, including browsing, purchasing products, and interacting with any content or services provided.</p>

<p><strong>Eligibility</strong> You must be at least 18 years old, or have the consent of a parent or guardian, to use this website. Any breach of these terms may result in the termination of your access to our platform.</p>

<p><strong>Products and Pricing</strong> We strive to ensure all product descriptions, pricing, and availability information on our website are accurate. However, errors may occur, and we reserve the right to correct them without prior notice.</p>

<p><strong>Orders and Payments</strong> All purchases are subject to our <a href="/returns-policy">Returns Policy</a>. By placing an order, you agree to pay the total amount shown at checkout. We may cancel orders that are suspected of fraud or abuse.</p>

<p><strong>Intellectual Property</strong> All content on this website, including text, graphics, logos, and images, is the property of Ishkaara and is protected by applicable intellectual property laws. You may not reproduce or use it without our prior written consent.</p>

<p><strong>Limitation of Liability</strong> To the fullest extent permitted by law, Ishkaara shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.</p>

<p><strong>Contact</strong> Questions about these terms? Reach out to our <a href="/contact-us">support team</a>. By using our site, you also acknowledge that your personal information is processed according to our <a href="/privacy-policy">Privacy Policy</a>.</p>`}
    />
  )
}