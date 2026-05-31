'use client'

import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
          success: {
            style: {
              background: '#f0fdfa',
              color: '#0f766e',
              border: '1px solid #99f6e4',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            },
          },
        }}
      />
    </AuthProvider>
  )
}