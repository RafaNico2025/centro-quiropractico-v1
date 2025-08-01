import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import AppointmentCalendar from '../components/AppointmentCalendar'
import AppointmentForm from '../components/AppointmentForm'
import NewIncomeForm from '../components/NewIncomeForm'
import PendingAppointmentsTab from '../components/PendingAppointmentsTab'
import { appointmentService } from '../services/appointment.service'
import { useToast } from '../components/ui/use-toast'
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Check, X, RotateCcw, UserX, Edit, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Componente para mostrar el estado del turno
const StatusLabel = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
    rescheduled: 'bg-purple-100 text-purple-800',
    rejected: 'bg-gray-100 text-gray-800'
  }

  const statusText = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    scheduled: 'Agendada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No Asistió',
    rescheduled: 'Reagendada',
    rejected: 'Rechazada'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusText[status] || status}
    </span>
  )
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false) // Nuevo estado para el formulario de ingresos
  const { toast } = useToast()
  const navigate = useNavigate()
  const [filtroEstado, setFiltroEstado] = useState('')
  const { user } = useAuth()
  const [showCancelledInCalendar, setShowCancelledInCalendar] = useState(false) // Nuevo estado para mostrar canceladas

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll({ includeCancelled: true })
      setAppointments(data)
      
      // Log temporal para verificar citas canceladas
      const cancelledCount = data.filter(a => a.status === 'cancelled').length
      console.log('🔄 Citas cargadas:', {
        total: data.length,
        canceladas: cancelledCount,
        estados: [...new Set(data.map(a => a.status))]
      })
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las citas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    const patientName = `${appointment.Patient?.firstName} ${appointment.Patient?.lastName}`

    if (newStatus === 'completed') {
      console.log('Setting selected appointment:', appointment)
      setSelectedAppointment(appointment)
      setShowIncomeForm(true) // Abrir el formulario de ingresos
      return
    }

    try {
      // Confirmación para cambios importantes
      let confirmMessage = ''
      let successMessage = ''
      
      switch (newStatus) {
        case 'completed':
          confirmMessage = `¿Confirmar que atendiste al paciente ${patientName}?`
          successMessage = `Cita de ${patientName} marcada como completada`
          break
        case 'cancelled':
          confirmMessage = `¿Confirmar cancelación de la cita de ${patientName}?\n\nNota: La cita se ocultará del calendario para liberar el horario.`
          successMessage = `Cita de ${patientName} cancelada correctamente`
          break
        case 'no_show':
          confirmMessage = `¿Confirmar que ${patientName} no asistió a la cita?`
          successMessage = `Registrado: ${patientName} no asistió a la cita`
          break
        case 'rescheduled':
          successMessage = `Preparando reagendado para ${patientName}`
          break
      }

      // Mostrar confirmación para cambios que no sean reagendar
      if (newStatus !== 'rescheduled' && !window.confirm(confirmMessage)) {
        return
      }

      if (newStatus === 'rescheduled') {
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
        // Pedir motivo de cancelación
        const cancellationReason = window.prompt('Motivo de cancelación (opcional):') || 'No especificado';
        
        // Actualizar estado a cancelled
        await appointmentService.update(appointmentId, { 
          status: 'cancelled',
          cancellationReason: cancellationReason 
        })
        
        // Recargar appointments para reflejar los cambios
        await loadAppointments()
        
        // Mostrar mensaje adicional sobre el calendario
        toast({
          title: "✅ Cita cancelada",
          description: `${successMessage}. El horario ahora está disponible en el calendario.`,
          duration: 4000
        })
        return // Salir temprano para evitar el toast duplicado
      } else {
        await appointmentService.update(appointmentId, { status: newStatus })
        await loadAppointments()
      }

      toast({
        title: "✅ Actualización exitosa",
        description: successMessage,
        duration: 3000
      })
      
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo actualizar el estado de la cita. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000
      })
    }
  }

  const handleSendReminder = async (appointmentId) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId)
      const patientName = `${appointment.Patient?.firstName} ${appointment.Patient?.lastName}`
      
      // Confirmación antes de enviar
      if (!window.confirm(`¿Enviar recordatorio por email a ${patientName}?`)) {
        return
      }

      // Mostrar loading
      toast({
        title: "📧 Enviando recordatorio...",
        description: `Enviando notificación a ${patientName}`,
        duration: 2000
      })

      const result = await appointmentService.sendReminder(appointmentId)
      
      toast({
        title: "✅ Recordatorio enviado",
        description: `Email enviado exitosamente a ${patientName}`,
        duration: 4000
      })

      console.log('Recordatorio enviado:', result)
      
    } catch (error) {
      console.error('Error al enviar recordatorio:', error)
      toast({
        title: "❌ Error",
        description: "No se pudo enviar el recordatorio. Verifica la configuración de email.",
        variant: "destructive",
        duration: 5000
      })
    }
  }

  const handleScheduleAppointment = async (appointmentId) => {
    try {
      await appointmentService.schedule(appointmentId)
      await loadAppointments() // Recargar las citas
      toast({
        title: "✅ Cita agendada",
        description: "La cita ha sido agendada oficialmente",
        duration: 3000
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo agendar la cita. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000
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
    
    // Estados que excluimos de próximas citas (finalizadas/problemáticas)
    const excludedStatuses = ['cancelled', 'rejected', 'no_show', 'completed']
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      appointmentDate.setHours(0, 0, 0, 0)
      
      return (
        appointmentDate.getTime() >= today.getTime() && 
        !excludedStatuses.includes(appointment.status)
      )
    })
  }

  // Estadísticas rápidas
  const getQuickStats = () => {
    const totalCitas = appointments.length
    const citasCompletadas = appointments.filter(a => a.status === 'completed').length
    const citasCanceladas = appointments.filter(a => a.status === 'cancelled').length
    const citasNoAsistio = appointments.filter(a => a.status === 'no_show').length
    const citasProgramadas = appointments.filter(a => a.status === 'scheduled').length
    
    return {
      total: totalCitas,
      completadas: citasCompletadas,
      programadas: citasProgramadas,
      canceladas: citasCanceladas,
      noAsistio: citasNoAsistio,
      tasaAsistencia: totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0
    }
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

  const handleIncomeFormSuccess = async () => {
    try {
      await appointmentService.update(selectedAppointment.id, { status: 'completed' })
      await loadAppointments()
      toast({
        title: "✅ Actualización exitosa",
        description: `Cita de ${selectedAppointment.Patient?.firstName} ${selectedAppointment.Patient?.lastName} marcada como completada`,
        duration: 3000
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el estado de la cita. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setShowIncomeForm(false)
      setSelectedAppointment(null)
    }
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
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>Nueva Cita</Button>
      </div>
      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">📅 Calendario</TabsTrigger>
          <TabsTrigger value="pending">📋 Solicitudes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6 mt-6">

      {/* Resumen de estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{getQuickStats().total}</div>
            <p className="text-xs text-muted-foreground">Total Citas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{getQuickStats().completadas}</div>
            <p className="text-xs text-muted-foreground">Atendidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{getQuickStats().programadas}</div>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{getQuickStats().canceladas}</div>
            <p className="text-xs text-muted-foreground">Canceladas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{getQuickStats().noAsistio}</div>
            <p className="text-xs text-muted-foreground">No Asistió</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{getQuickStats().tasaAsistencia}%</div>
            <p className="text-xs text-muted-foreground">Tasa Asistencia</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citas de Hoy - {format(new Date(), 'PPP', { locale: es })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTodayAppointments().map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
                      <StatusLabel status={appointment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(appointment.startTime)} - {appointment.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {appointment.status === 'approved' && (
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleScheduleAppointment(appointment.id)}
                      >
                        📅 Agendar Oficialmente
                      </Button>
                    )}
                    {(appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                      <>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                        >
                          ✓ Atendido
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-blue-500 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleStatusChange(appointment.id, 'rescheduled')}
                        >
                          📅 Reagendar
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                          onClick={() => handleStatusChange(appointment.id, 'no_show')}
                        >
                          ⚠ No Asistió
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-red-500 text-red-700 hover:bg-red-50"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          ✕ Cancelar
                        </Button>
                      </>
                    )}
                    {appointment.status === 'pending' && (
                      <span className="text-sm text-yellow-600 font-medium">⏳ Pendiente</span>
                    )}
                    {appointment.status === 'completed' && (
                      <span className="text-sm text-green-600 font-medium">✓ Completada</span>
                    )}
                    {appointment.status === 'cancelled' && (
                      <span className="text-sm text-red-600 font-medium">✕ Cancelada</span>
                    )}
                    {appointment.status === 'no_show' && (
                      <span className="text-sm text-yellow-600 font-medium">⚠ No Asistió</span>
                    )}
                    {appointment.status === 'rejected' && (
                      <span className="text-sm text-gray-600 font-medium">❌ Rechazada</span>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
                      <StatusLabel status={appointment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(appointment.date)} - {formatTime(appointment.startTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {appointment.status === 'approved' && (
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleScheduleAppointment(appointment.id)}
                      >
                        📅 Agendar Oficialmente
                      </Button>
                    )}
                    {(appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                      <>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-blue-500 text-blue-700 hover:bg-blue-50"
                          onClick={() => handleStatusChange(appointment.id, 'rescheduled')}
                        >
                          📅 Reagendar
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-purple-500 text-purple-700 hover:bg-purple-50"
                          onClick={() => handleSendReminder(appointment.id)}
                        >
                          📧 Recordatorio
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="border-red-500 text-red-700 hover:bg-red-50"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          ✕ Cancelar
                        </Button>
                      </>
                    )}
                    {appointment.status === 'pending' && (
                      <span className="text-sm text-yellow-600 font-medium">⏳ Pendiente de revisión</span>
                    )}
                    {appointment.status === 'completed' && (
                      <span className="text-sm text-green-600 font-medium">✓ Completada</span>
                    )}
                    {appointment.status === 'cancelled' && (
                      <span className="text-sm text-red-600 font-medium">✕ Cancelada</span>
                    )}
                    {appointment.status === 'no_show' && (
                      <span className="text-sm text-yellow-600 font-medium">⚠ No Asistió</span>
                    )}
                    {appointment.status === 'rescheduled' && (
                      <span className="text-sm text-purple-600 font-medium">📅 Reagendada</span>
                    )}
                    {appointment.status === 'rejected' && (
                      <span className="text-sm text-gray-600 font-medium">❌ Rechazada</span>
                    )}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Calendario de Citas</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">
                  Mostrar canceladas:
                </label>
                <input
                  type="checkbox"
                  checked={showCancelledInCalendar}
                  onChange={(e) => setShowCancelledInCalendar(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent>
              <AppointmentCalendar
                appointments={appointments}
                onSelectEvent={handleSelectEvent}
                showCancelled={showCancelledInCalendar}
              />
            </CardContent>
          </Card>
      </div>

      {/* Nueva sección para gestión de todas las citas */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Citas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Administra el estado de tus citas confirmadas y activas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filtros de estado */}
              <div className="flex gap-2 flex-wrap mb-4">
                <Button 
                  variant={!filtroEstado ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('')}
                >
                  Todas
                </Button>
                <Button 
                  variant={filtroEstado === 'scheduled' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('scheduled')}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  Programadas
                </Button>
                <Button 
                  variant={filtroEstado === 'completed' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('completed')}
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  Completadas
                </Button>
                <Button 
                  variant={filtroEstado === 'cancelled' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('cancelled')}
                  className="bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Canceladas
                </Button>
                <Button 
                  variant={filtroEstado === 'no_show' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('no_show')}
                  className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                  No Asistió
                </Button>

                <Button 
                  variant={filtroEstado === 'pending' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado('pending')}
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                >
                  Pendientes
                </Button>
              </div>

              {/* Lista de citas filtradas */}
              <div className="space-y-3">
                {appointments
                  .filter(appointment => {
                    // Excluir rechazadas de la gestión principal
                    if (appointment.status === 'rejected') return false
                    // Aplicar filtro de estado si existe
                    return !filtroEstado || appointment.status === filtroEstado
                  })
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10) // Mostrar solo las últimas 10
                  .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{appointment.Patient?.firstName} {appointment.Patient?.lastName}</p>
                        <StatusLabel status={appointment.status} />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(appointment.date)} - {formatTime(appointment.startTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(appointment.status === 'scheduled' || appointment.status === 'rescheduled') && (
                        <>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            ✓ Marcar Atendido
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                            onClick={() => handleStatusChange(appointment.id, 'no_show')}
                          >
                            ⚠ No Asistió
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="border-red-500 text-red-700 hover:bg-red-50"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          >
                            ✕ Cancelar
                          </Button>
                        </>
                      )}
                      {appointment.status !== 'scheduled' && appointment.status !== 'rescheduled' && (
                        <div className="text-sm text-muted-foreground">
                          Estado actualizado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {appointments
                  .filter(appointment => {
                    if (appointment.status === 'rejected') return false
                    return !filtroEstado || appointment.status === filtroEstado
                  }).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay citas con el estado seleccionado
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6 mt-6">
          <PendingAppointmentsTab />
        </TabsContent>
        

      </Tabs>

      <AppointmentForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) {
            setSelectedAppointment(null)
          }
        }}
        onSuccess={loadAppointments}
        appointment={selectedAppointment}
        onPatientsUpdate={loadAppointments}
      />

      <NewIncomeForm
        open={showIncomeForm}
        onOpenChange={setShowIncomeForm}
        onSuccess={handleIncomeFormSuccess} // Confirmar el estado de la cita después de completar el formulario
        onPatientsUpdate={loadAppointments}
        selectedPatient={selectedAppointment?.Patient || null}
      />
    </div>
  )
}