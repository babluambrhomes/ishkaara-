import type { Metadata } from 'next'
import StaticPageContent from '@/components/shared/static-page-content'

export const metadata: Metadata = {
  title: 'Help Center',
}

export default function HelpPage() {
  return (
    <StaticPageContent
      title='Help Center'
      content={`<p>Welcome to our Help Center! We're here to assist you with any questions or concerns you may have while shopping with us.</p>

<p><strong>Placing and Managing Orders</strong> Placing an order is simple and secure. Browse our product categories, add items to your cart, and proceed to checkout. Once your order is placed, you can track its status through your account under the "My Orders" section.</p>

<p><strong>Shipping and Returns</strong> We offer a variety of shipping options to suit your needs, including standard and express delivery. For detailed shipping costs and delivery timelines, visit our <a href="/returns-policy">Returns Policy</a> page. If you are not satisfied with your purchase, our hassle-free return process allows you to initiate a return within the specified timeframe.</p>

<p><strong>Account and Support</strong> Log in to update your personal information, payment methods, and saved addresses. If you encounter any issues or need further assistance, our customer support team is available via email, live chat, or phone. Visit our <a href="/contact-us">Contact Us</a> page for support hours and contact details.</p>

<p>Still stuck? Check our <a href="/faq">FAQ</a> for quick answers to common questions.</p>`}
    />
  )
}