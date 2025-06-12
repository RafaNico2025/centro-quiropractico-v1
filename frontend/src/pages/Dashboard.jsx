import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Leer precios del localStorage o usar valores por defecto
  const getInitialPrices = () => {
    const saved = localStorage.getItem('servicePrices')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { consultaInicial: 18000, consultaSeguimiento: 16000 }
      }
    }
    return { consultaInicial: 18000, consultaSeguimiento: 16000 }
  }

  const [prices, setPrices] = useState(getInitialPrices)

  // Guardar precios en localStorage
  const handleSavePrices = () => {
    localStorage.setItem('servicePrices', JSON.stringify(prices))
    alert('Precios guardados correctamente')
  }

  const handlePriceChange = (service, value) => {
    setPrices(prev => ({
      ...prev,
      [service]: Number(value)
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Gonzalo Cajeao Quiropraxia</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Bienvenido, {user?.username}</span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gestión de Turnos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Gestión de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Administra los turnos y el calendario de consultas</p>
              <Button onClick={() => navigate('/appointments')} className="w-full">
                Ver Calendario
              </Button>
            </CardContent>
          </Card>

          {/* Historias Clínicas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Historias Clínicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Accede y gestiona las historias clínicas de los pacientes</p>
              <Button onClick={() => navigate('/clinical-records')} className="w-full">
                Ver Historias
              </Button>
            </CardContent>
          </Card>

          {/* Métricas y Estadísticas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Visualiza estadísticas y métricas del consultorio</p>
              <Button onClick={() => navigate('/stats')} className="w-full">
                Ver Métricas
              </Button>
            </CardContent>
          </Card>

          {/* Caja Diaria */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Caja Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Registra y controla los ingresos diarios</p>
              <Button onClick={() => navigate('/accounting')} className="w-full">
                Abrir Caja
              </Button>
            </CardContent>
          </Card>

          {/* Gestión de Precios */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Precios de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consulta Inicial</label>
                  <input
                    type="number"
                    value={prices.consultaInicial}
                    onChange={(e) => handlePriceChange('consultaInicial', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consulta de Seguimiento</label>
                  <input
                    type="number"
                    value={prices.consultaSeguimiento}
                    onChange={(e) => handlePriceChange('consultaSeguimiento', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <Button className="w-full mt-2" onClick={handleSavePrices}>Guardar Precios</Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Pacientes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Administra la información de los pacientes</p>
              <Button onClick={() => navigate('/patients')} className="w-full">
                Ver Pacientes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard