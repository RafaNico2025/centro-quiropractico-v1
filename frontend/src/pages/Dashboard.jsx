import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const [prices, setPrices] = useState({
    consultaInicial: 2500,
    consultaSeguimiento: 2000,
    tratamiento: 3000,
    masaje: 1800
  })

  const handlePriceChange = (service, value) => {
    setPrices(prev => ({
      ...prev,
      [service]: value
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gestión de Turnos */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Administra los turnos y el calendario de consultas</p>
            <Button onClick={() => navigate('/appointments')} className="w-full">
              Ver Calendario
            </Button>
          </CardContent>
        </Card>

        {/* Historias Clínicas */}
        <Card>
          <CardHeader>
            <CardTitle>Historias Clínicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Accede y gestiona las historias clínicas de los pacientes</p>
            <Button onClick={() => navigate('/clinical-records')} className="w-full">
              Ver Historias
            </Button>
          </CardContent>
        </Card>

        {/* Métricas y Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Visualiza estadísticas y métricas del consultorio</p>
            <Button onClick={() => navigate('/stats')} className="w-full">
              Ver Métricas
            </Button>
          </CardContent>
        </Card>

        {/* Caja Diaria */}
        <Card>
          <CardHeader>
            <CardTitle>Caja Diaria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Registra y controla los ingresos diarios</p>
            <Button onClick={() => navigate('/accounting')} className="w-full">
              Abrir Caja
            </Button>
          </CardContent>
        </Card>

        {/* Gestión de Precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Consulta Inicial</label>
                <input
                  type="number"
                  value={prices.consultaInicial}
                  onChange={(e) => handlePriceChange('consultaInicial', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Consulta de Seguimiento</label>
                <input
                  type="number"
                  value={prices.consultaSeguimiento}
                  onChange={(e) => handlePriceChange('consultaSeguimiento', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tratamiento</label>
                <input
                  type="number"
                  value={prices.tratamiento}
                  onChange={(e) => handlePriceChange('tratamiento', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Masaje</label>
                <input
                  type="number"
                  value={prices.masaje}
                  onChange={(e) => handlePriceChange('masaje', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <Button className="w-full mt-2">Guardar Precios</Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Administra la información de los pacientes</p>
            <Button onClick={() => navigate('/patients')} className="w-full">
              Ver Pacientes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 