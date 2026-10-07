import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/shared/client-providers'
import { getSetting } from '@/lib/actions/setting.actions'
import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
      >
        <ClientProviders setting={setting}>

          <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='flex-1 flex flex-col'>{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
