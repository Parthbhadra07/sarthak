import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAdminToken } from '../lib/adminAuth'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = getAdminToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

