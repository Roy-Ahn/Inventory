import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageWrapper from '@/components/PageWrapper'

export const metadata: Metadata = {
  title: 'Inventory - Secure Storage Booking',
  description: 'Find flexible, affordable, and secure storage solutions near you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <DataProvider>
            <div className="flex flex-col min-h-screen font-sans text-gray-800">
              <Header />
              <main className="flex-grow">
                <PageWrapper>
                  {children}
                </PageWrapper>
              </main>
              <Footer />
            </div>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

