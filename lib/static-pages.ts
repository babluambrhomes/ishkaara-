export type StaticPage = {
  title: string
  content: string
}

export const staticPages: Record<string, StaticPage> = {
  'about-us': {
    title: 'About Us',
    content: `Welcome to **Ishkaara**, your trusted destination for quality products and exceptional service.

Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.

At Ishkaara, we prioritize customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there's something for everyone. We also make your shopping experience seamless with fast shipping, secure payments, and excellent customer support.

As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing Ishkaara - we look forward to being a part of your journey and delivering value every step of the way.`,
  },
  'contact-us': {
    title: 'Contact Us',
    content: `We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us. Our team is ready to assist you and ensure you have the best shopping experience.

**Customer Support**
For inquiries about orders, products, or account-related issues, contact our customer support team:
- **Email:** support@ishkaara.com
- **Phone:** +1 (123) 456-7890
- **Live Chat:** Available on our website from 9 AM to 6 PM (Monday to Friday).

**Head Office**
For corporate or business-related inquiries, reach out to our headquarters:
- **Address:** 1234 E-Commerce St, Suite 567, Business City, BC 12345
- **Phone:** +1 (987) 654-3210

We look forward to assisting you! Your satisfaction is our priority.`,
  },
  faq: {
    title: 'FAQ - Frequently Asked Questions',
    content: `Here are the answers to the questions we get asked the most. Can't find what you're looking for? Contact our [support team](/contact-us).

**How do I place an order?**
Placing an order is simple. Browse our categories, add items to your cart, and proceed to checkout. You can pay securely using your preferred payment method and track your order from your account.

**How can I track my order?**
Once your order is placed, you can track its status under "My Orders" in your account. You will also receive email updates at each step of the journey.

**What are the shipping options?**
We offer standard and express delivery options with different costs and delivery timelines. Free shipping is available when your order qualifies - check the cart page during checkout for details.

**How do I return an item?**
If you are not satisfied with a purchase, you can initiate a return within the specified timeframe from your order page. See our [Returns Policy](/returns-policy) for full details.

**How do I cancel or modify my order?**
If you need to cancel or modify an order, please contact our support team as soon as possible. Once an order is processed, changes may no longer be possible.

**Which payment methods do you accept?**
We accept all major debit and credit cards, along with popular payment options such as PayPal and Stripe. All payments are processed securely.

**Is my personal information safe?**
Yes. We take data security seriously and use robust measures to protect your information. Read our [Privacy Policy](/privacy-policy) to learn more.`,
  },
  help: {
    title: 'Help Center',
    content: `Welcome to our Help Center! We're here to assist you with any questions or concerns you may have while shopping with us.

**Placing and Managing Orders**
Placing an order is simple and secure. Browse our product categories, add items to your cart, and proceed to checkout. Once your order is placed, you can track its status through your account under the "My Orders" section.

**Shipping and Returns**
We offer a variety of shipping options to suit your needs, including standard and express delivery. For detailed shipping costs and delivery timelines, visit our [Returns Policy](/returns-policy) page. If you are not satisfied with your purchase, our hassle-free return process allows you to initiate a return within the specified timeframe.

**Account and Support**
Log in to update your personal information, payment methods, and saved addresses. If you encounter any issues or need further assistance, our customer support team is available via email, live chat, or phone. Visit our [Contact Us](/contact-us) page for support hours and contact details.

Still stuck? Check our [FAQ](/faq) for quick answers to common questions.`,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you interact with our services. By using our platform, you consent to the practices described herein.

**Information We Collect**
We collect data such as your name, email address, and payment details to provide you with tailored services and improve your experience. This information may also be used for marketing purposes, but only with your consent.

**How We Use Your Information**
Your information helps us process orders, deliver products, provide customer support, and personalize your shopping experience. We may also use aggregated data to improve our platform and understand customer preferences.

**Information Sharing**
We may share your data with trusted third-party providers to facilitate transactions or deliver products. We never sell your personal information to third parties.

**Data Security**
Your data is safeguarded through robust security measures to prevent unauthorized access, alteration, or disclosure.

**Your Rights**
You have the right to access, correct, or delete your personal information at any time. For inquiries or concerns regarding your privacy, please contact our [support team](/contact-us).`,
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    content: `Welcome to **Ishkaara**. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our platform, including browsing, purchasing products, and interacting with any content or services provided.

**Eligibility**
You must be at least 18 years old, or have the consent of a parent or guardian, to use this website. Any breach of these terms may result in the termination of your access to our platform.

**Products and Pricing**
We strive to ensure all product descriptions, pricing, and availability information on our website are accurate. However, errors may occur, and we reserve the right to correct them without prior notice.

**Orders and Payments**
All purchases are subject to our [Returns Policy](/returns-policy). By placing an order, you agree to pay the total amount shown at checkout. We may cancel orders that are suspected of fraud or abuse.

**Intellectual Property**
All content on this website, including text, graphics, logos, and images, is the property of Ishkaara and is protected by applicable intellectual property laws. You may not reproduce or use it without our prior written consent.

**Limitation of Liability**
To the fullest extent permitted by law, Ishkaara shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform.

**Contact**
Questions about these terms? Reach out to our [support team](/contact-us). By using our site, you also acknowledge that your personal information is processed according to our [Privacy Policy](/privacy-policy).`,
  },
  'returns-policy': {
    title: 'Returns & Replacements',
    content: `We want you to be completely satisfied with your purchase. If something isn't right, our returns and replacement process is here to help.

**Return Window**
You may initiate a return within **30 days** of receiving your order. Items must be unused, in their original packaging, and in the same condition as delivered.

**How to Start a Return**
1. Go to "My Orders" in your account.
2. Select the order and choose the item you want to return.
3. Follow the instructions to print a return label.
4. Ship the item back using the provided label.

**Refunds**
Once we receive and inspect your return, a refund will be issued to your original payment method within **5-7 business days**. Shipping costs are refunded only if the return is due to an error on our side.

**Replacement Items**
If your item arrived damaged or defective, we will replace it at no additional cost. Contact our [support team](/contact-us) with your order details and photos for a quick resolution.

For any other questions, feel free to visit our [FAQ](/faq) or reach out to us at any time.`,
  },
}