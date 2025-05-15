import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import ClinicalRecords from './pages/ClinicalRecords'
import Stats from './pages/Stats'
import Accounting from './pages/Accounting'
import Appointments from './pages/Appointments'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas para pacientes */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas para administradores */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute requireAdmin>
                <Patients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinical-records"
            element={
              <ProtectedRoute requireAdmin>
                <ClinicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute requireAdmin>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting"
            element={
              <ProtectedRoute requireAdmin>
                <Accounting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requireAdmin>
                <Appointments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
} 