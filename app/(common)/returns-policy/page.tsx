import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'

export const metadata: Metadata = {
  title: 'Returns & Replacements',
}

export default function ReturnsPolicyPage() {
  return (
    <StaticPageContent
      title='Returns & Replacements'
      content={`<p>We want you to be completely satisfied with your purchase. If something isn't right, our returns and replacement process is here to help.</p>

<p><strong>Return Window</strong> You may initiate a return within <strong>30 days</strong> of receiving your order. Items must be unused, in their original packaging, and in the same condition as delivered.</p>

<p><strong>How to Start a Return</strong></p>
<ol><li>Go to "My Orders" in your account.</li><li>Select the order and choose the item you want to return.</li><li>Follow the instructions to print a return label.</li><li>Ship the item back using the provided label.</li></ol>

<p><strong>Refunds</strong> Once we receive and inspect your return, a refund will be issued to your original payment method within <strong>5-7 business days</strong>. Shipping costs are refunded only if the return is due to an error on our side.</p>

<p><strong>Replacement Items</strong> If your item arrived damaged or defective, we will replace it at no additional cost. Contact our <a href="/contact-us">support team</a> with your order details and photos for a quick resolution.</p>

<p>For any other questions, feel free to visit our <a href="/faq">FAQ</a> or reach out to us at any time.</p>`}
    />
  )
}