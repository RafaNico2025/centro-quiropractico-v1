import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PatientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointmentRequest, setAppointmentRequest] = useState({
    motivo: '',
    preferenciaDia: '',
    preferenciaHora: '',
    notas: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario por email
    console.log('Solicitud de cita:', appointmentRequest)
    setShowAppointmentForm(false)
    // Mostrar mensaje de éxito
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setAppointmentRequest(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openWhatsApp = () => {
    const message = `Hola, soy ${user?.name || 'un paciente'}. Me gustaría solicitar una cita.`
    const whatsappUrl = `https://wa.me/5493516171562?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Centro Quiropráctico</h1>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Mi Panel de Paciente</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Paciente */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Mi Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700">Nombre:</p>
                  <p className="text-gray-600">{user?.name || 'No disponible'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Email:</p>
                  <p className="text-gray-600">{user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Última Consulta:</p>
                  <p className="text-gray-600">15/04/2024</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Próxima Consulta:</p>
                  <p className="text-gray-600">22/04/2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solicitar Cita */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Solicitar Nueva Cita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Puedes solicitar una cita a través de WhatsApp o completando el formulario.
                  Nos pondremos en contacto contigo para confirmar la fecha y hora.
                </p>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={openWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Solicitar por WhatsApp
                  </Button>
                  <Button 
                    onClick={() => setShowAppointmentForm(true)}
                    className="flex-1"
                  >
                    Usar Formulario
                  </Button>
                </div>

                {showAppointmentForm && (
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de la Consulta
                      </label>
                      <textarea
                        name="motivo"
                        value={appointmentRequest.motivo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferencia de Día
                      </label>
                      <input
                        type="text"
                        name="preferenciaDia"
                        value={appointmentRequest.preferenciaDia}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Lunes a Viernes"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferencia de Hora
                      </label>
                      <input
                        type="text"
                        name="preferenciaHora"
                        value={appointmentRequest.preferenciaHora}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Mañana o Tarde"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Adicionales
                      </label>
                      <textarea
                        name="notas"
                        value={appointmentRequest.notas}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" className="flex-1">
                        Enviar Solicitud
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAppointmentForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard 