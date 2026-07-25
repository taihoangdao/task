// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Timeline App',
  description: 'Ứng dụng quản lý công việc theo timeline',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}