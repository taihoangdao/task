// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Timeline App',
  description: 'Ứng dụng quản lý công việc theo timeline',
  icons: {
    icon: '/tasklogo.png',
    apple: '/tasklogo.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Timeline" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/tasklogo.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}