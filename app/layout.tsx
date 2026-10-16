import { Playfair_Display, Jost } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/shared/client-providers'
import { getSetting } from '@/lib/actions/setting.actions'



const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting()
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const setting = await getSetting()

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`min-h-screen ${jost.variable} ${playfair.variable} antialiased scroll-smooth`}
      >
        <ClientProviders setting={setting}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
