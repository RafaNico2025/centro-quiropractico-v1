import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/patient-dashboard" />
  }

  return children
} 