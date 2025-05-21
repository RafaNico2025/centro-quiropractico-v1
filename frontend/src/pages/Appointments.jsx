import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { appointmentService } from '../services/appointment.service'
import { useToast } from '../components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AppointmentForm } from '../components/AppointmentForm'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppointmentCalendar } from '../components/AppointmentCalendar'

// Componente para mostrar el estado del turno
const StatusLabel = ({ status }) => {
  const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-yellow-100 text-yellow-800',
    rescheduled: 'bg-purple-100 text-purple-800'
  }

  const statusText = {
    scheduled: 'Programado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_show: 'No Asistió',
    rescheduled: 'Reagendado'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  )
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll()
      setAppointments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'rescheduled') {
        const appointment = appointments.find(a => a.id === appointmentId)
        await appointmentService.update(appointmentId, { status: newStatus })
        const updatedAppointments = appointments.map(app => 
          app.id === appointmentId 
            ? { ...app, status: newStatus }
            : app
        )
        setAppointments(updatedAppointments)
        setSelectedAppointment(appointment)
        setShowForm(true)
      } else if (newStatus === 'cancelled') {
        await appointmentService.delete(appointmentId)
        await loadAppointments()
        toast({
          title: "Éxito",
          description: "Cita cancelada correctamente"
        })
      } else {
        await appointmentService.update(appointmentId, { status: newStatus })
        await loadAppointments()
        toast({
          title: "Éxito",
          description: "Estado de la cita actualizado correctamente"
        })
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive"
      })
    }
  }

  const getTodayAppointments = () => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    return appointments.filter(appointment => appointment.date === todayString)
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(0, 0, 0, 0)
      return appointmentDate.getTime() > today.getTime()
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
      return format(date, 'PPP', { locale: es })
    } catch (error) {
      console.error('Error al formatear fecha:', error)
      return dateString
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource)
    setShowForm(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Citas</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>Nueva Cita</Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTodayAppointments().map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
                      <StatusLabel status={appointment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(appointment.startTime)} - {appointment.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                        >
                          Completar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleStatusChange(appointment.id, 'no_show')}
                        >
                          No Asistió
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {getTodayAppointments().length === 0 && (
                <p className="text-center text-muted-foreground">No hay citas programadas para hoy</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getUpcomingAppointments().map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
                      <StatusLabel status={appointment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appointment.date)} - {formatTime(appointment.startTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusChange(appointment.id, 'rescheduled')}
                    >
                      Reagendar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
              {getUpcomingAppointments().length === 0 && (
                <p className="text-center text-muted-foreground">No hay próximas citas programadas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar 
              appointments={appointments}
              onSelectEvent={handleSelectEvent}
            />
          </CardContent>
        </Card>
      </div>

      <AppointmentForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={loadAppointments}
        appointment={selectedAppointment}
      />
    </div>
  )
} 