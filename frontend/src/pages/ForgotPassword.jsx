import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { authService } from '../services/auth.service'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Por favor ingresa tu email')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')
      
      await authService.forgotPassword(email)
      setMessage('Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada.')
    } catch (err) {
      setError(err.message || 'Error al enviar el email de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </div>
        </form>

        <div className="flex flex-col items-center space-y-4 mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            ← Volver al Login
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
} 