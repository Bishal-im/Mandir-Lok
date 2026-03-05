import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Mandirlok – Online Pooja & Temple Booking',
  description:
    'Book online pooja, chadhava offerings at temples across India. Receive pooja video on WhatsApp. Authentic pandits, seamless booking.',
  keywords: 'online pooja, temple booking, chadhava, pandit, mandir, pooja online, india temples',
  openGraph: {
    title: 'Mandirlok – Online Pooja & Temple Booking',
    description: 'Connect with holy pilgrimage sites and divine temples of India',
    type: 'website',
    siteName: 'Mandirlok',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Razorpay */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="bg-[#fdf6ee] text-[#1a1209] antialiased">
        {children}
      </body>
    </html>
  )
}
