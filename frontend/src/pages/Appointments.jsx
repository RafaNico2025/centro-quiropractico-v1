import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { appointmentService } from '../services/appointment.service'
import { useToast } from '../components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AppointmentForm } from '../components/AppointmentForm'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

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
      await appointmentService.update(appointmentId, { status: newStatus })
      await loadAppointments()
      toast({
        title: "Éxito",
        description: "Estado de la cita actualizado correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive"
      })
    }
  }

  const getTodayAppointments = () => {
    const today = new Date()
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      return appointmentDate.toDateString() === today.toDateString()
    })
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      return appointmentDate > today
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Citas</h1>
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
                    <p className="font-medium">{appointment.Patient.firstName} {appointment.Patient.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.startTime), 'HH:mm')} - {appointment.reason}
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
                    <p className="font-medium">{appointment.Patient.firstName} {appointment.Patient.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appointment.date), 'PPP', { locale: es })} - {format(new Date(appointment.startTime), 'HH:mm')}
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
            <div className="grid grid-cols-7 gap-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, index) => {
                const currentDate = new Date()
                currentDate.setDate(currentDate.getDate() + index)
                const dayAppointments = appointments.filter(appointment => {
                  const appointmentDate = new Date(appointment.date)
                  return appointmentDate.toDateString() === currentDate.toDateString()
                })

                return (
                  <div
                    key={index}
                    className="h-24 rounded-lg border p-2 hover:bg-accent"
                  >
                    <div className="text-sm font-medium">{currentDate.getDate()}</div>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.map(appointment => (
                        <div 
                          key={appointment.id}
                          className="rounded bg-primary/10 p-1 text-xs"
                        >
                          {format(new Date(appointment.startTime), 'HH:mm')} - {appointment.Patient.firstName}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentForm 
        open={showForm} 
        onOpenChange={setShowForm} 
        onSuccess={loadAppointments}
      />
    </div>
  )
} 