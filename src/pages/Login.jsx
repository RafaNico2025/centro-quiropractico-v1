import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    // Simulamos un login exitoso
    const userData = {
      email: data.email,
      role: 'admin' // o 'patient' dependiendo del usuario
    }
    login(userData)
    navigate('/dashboard')
  }

  const loginAsAdmin = () => {
    const userData = {
      email: 'admin@test.com',
      role: 'admin'
    }
    login(userData)
    navigate('/dashboard')
  }

  const loginAsPatient = () => {
    const userData = {
      email: 'patient@test.com',
      role: 'patient'
    }
    login(userData)
    navigate('/patient-dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Botones de prueba */}
        <div className="space-y-4">
          <Button 
            onClick={loginAsAdmin} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Iniciar como Administrador
          </Button>
          <Button 
            onClick={loginAsPatient} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Iniciar como Paciente
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O</span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'El correo es requerido' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'La contraseña es requerida' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 