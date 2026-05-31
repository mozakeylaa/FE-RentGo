'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import RoleGate from '@/components/RoleGate'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGate allow={['ADMIN']}>
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      </RoleGate>
    </ProtectedRoute>
  )
}