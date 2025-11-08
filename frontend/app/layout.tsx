import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { StoreInitializer } from '@/components/StoreInitializer'
import { Header } from '@/components/Header'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Cartika - Modern Shopping Experience',
  description: 'Experience the future of online shopping with Cartika',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <StoreInitializer />
          <Header />
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
                <p>© {new Date().getFullYear()} Cartika. All rights reserved.</p>
              </div>
            </footer>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !shadow-lg',
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

