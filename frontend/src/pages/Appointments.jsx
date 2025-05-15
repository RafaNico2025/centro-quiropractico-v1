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

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
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
    today.setHours(0, 0, 0, 0)
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(0, 0, 0, 0)
      return appointmentDate.getTime() === today.getTime()
    })
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
    if (!timeString) return '';
    // Asegurarse de que el tiempo tenga el formato correcto
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }

  // --- NUEVO: Cálculo del calendario del mes actual ---
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  // Día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
  let startDay = firstDayOfMonth.getDay();
  // Ajustar para que el calendario empiece en lunes
  startDay = startDay === 0 ? 6 : startDay - 1;
  // Total de celdas a mostrar (días + vacíos)
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  // --- FIN NUEVO ---

  // Función para obtener la fecha en formato YYYY-MM-DD
  const getYYYYMMDD = (year, month, day) => {
    const mm = (month + 1).toString().padStart(2, '0');
    const dd = day.toString().padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

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
                    <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
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
                    <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
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
            <div className="grid grid-cols-7 gap-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: totalCells }).map((_, index) => {
                const dayNumber = index - startDay + 1;
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                let cellDateString = '';
                if (isCurrentMonth) {
                  cellDateString = getYYYYMMDD(year, month, dayNumber);
                }
                const dayAppointments = isCurrentMonth
                  ? appointments.filter(appointment => appointment.date === cellDateString)
                  : [];
                return (
                  <div
                    key={index}
                    className={`h-24 rounded-lg border p-2 hover:bg-accent flex flex-col ${!isCurrentMonth ? 'bg-muted text-muted-foreground' : ''}`}
                  >
                    <div className="text-sm font-medium">{isCurrentMonth ? dayNumber : ''}</div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16 pr-1">
                      {dayAppointments.map(appointment => (
                        <div 
                          key={appointment.id}
                          className="rounded bg-primary/10 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {formatTime(appointment.startTime)} - {appointment.Patient?.firstName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
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