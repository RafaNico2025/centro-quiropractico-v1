import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'

const PatientDashboard = () => {
  const { user } = useAuth()
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

  const openWhatsApp = () => {
    const message = `Hola, soy ${user?.name || 'un paciente'}. Me gustaría solicitar una cita.`
    const whatsappUrl = `https://wa.me/5491234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mi Panel de Paciente</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Mi Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Nombre:</p>
                <p>{user?.name || 'No disponible'}</p>
              </div>
              <div>
                <p className="font-medium">Email:</p>
                <p>{user?.email || 'No disponible'}</p>
              </div>
              <div>
                <p className="font-medium">Última Consulta:</p>
                <p>15/04/2024</p>
              </div>
              <div>
                <p className="font-medium">Próxima Consulta:</p>
                <p>22/04/2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitar Cita */}
        <Card>
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
                    <label className="block text-sm font-medium mb-1">
                      Motivo de la Consulta
                    </label>
                    <textarea
                      name="motivo"
                      value={appointmentRequest.motivo}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Preferencia de Día
                    </label>
                    <input
                      type="text"
                      name="preferenciaDia"
                      value={appointmentRequest.preferenciaDia}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Ej: Lunes a Viernes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Preferencia de Hora
                    </label>
                    <input
                      type="text"
                      name="preferenciaHora"
                      value={appointmentRequest.preferenciaHora}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Ej: Mañana o Tarde"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notas Adicionales
                    </label>
                    <textarea
                      name="notas"
                      value={appointmentRequest.notas}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
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
    </div>
  )
}

export default PatientDashboard 