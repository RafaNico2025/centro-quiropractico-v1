import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { appointmentService } from '../services/appointment.service'
import { userService } from '../services/user.service'
import { useToast } from './ui/use-toast'
import { CheckCircle, XCircle, Calendar, Clock, User, MessageSquare } from 'lucide-react'

export default function PendingAppointmentsTab() {
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalData, setApprovalData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    professionalId: '',
    notes: ''
  })
  const [rejectionData, setRejectionData] = useState({
    rejectionReason: '',
    alternativeOptions: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPendingAppointments()
    loadProfessionals()
  }, [])

  const loadPendingAppointments = async () => {
    try {
      const data = await appointmentService.getPending()
      setPendingAppointments(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las solicitudes pendientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProfessionals = async () => {
    try {
      const data = await userService.getProfessionals()
      setProfessionals(data)
    } catch (error) {
      console.error('Error al cargar profesionales:', error)
    }
  }

  const handleApprove = (appointment) => {
    setSelectedAppointment(appointment)
    setApprovalData({
      date: appointment.date || '',
      startTime: appointment.startTime || '',
      endTime: appointment.endTime || '',
      professionalId: appointment.professionalId || '',
      notes: appointment.notes || ''
    })
    setShowApproveDialog(true)
  }

  const handleReject = (appointment) => {
    setSelectedAppointment(appointment)
    setRejectionData({
      rejectionReason: '',
      alternativeOptions: ''
    })
    setShowRejectDialog(true)
  }

  const confirmApproval = async () => {
    try {
      const response = await appointmentService.approve(selectedAppointment.id, approvalData)
      
      // El backend ya se encarga de eliminar las solicitudes alternativas
      const eliminatedCount = response.eliminatedAlternatives || 0
      
      if (eliminatedCount > 0) {
        toast({
          title: "✅ Solicitud aprobada",
          description: `La solicitud de ${selectedAppointment.Patient?.firstName} ha sido aprobada y se eliminaron ${eliminatedCount} solicitud(es) alternativa(s)`,
          duration: 4000
        })
      } else {
        toast({
          title: "✅ Solicitud aprobada",
          description: `La solicitud de ${selectedAppointment.Patient?.firstName} ha sido aprobada`,
          duration: 3000
        })
      }

      setShowApproveDialog(false)
      setSelectedAppointment(null)
      loadPendingAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar la solicitud",
        variant: "destructive"
      })
    }
  }

  const confirmRejection = async () => {
    try {
      await appointmentService.reject(selectedAppointment.id, rejectionData)
      
      toast({
        title: "📋 Solicitud procesada",
        description: `La solicitud de ${selectedAppointment.Patient?.firstName} ha sido rechazada`,
        duration: 3000
      })

      setShowRejectDialog(false)
      setSelectedAppointment(null)
      loadPendingAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar la solicitud",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'No especificada'
    return timeString.slice(0, 5)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Cargando solicitudes...</div>
  }

  return (
    <div className="space-y-6">
      {pendingAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay solicitudes pendientes
            </h3>
            <p className="text-gray-500 text-center">
              Todas las solicitudes han sido procesadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingAppointments.map((appointment) => (
            <Card key={appointment.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {appointment.Patient?.firstName} {appointment.Patient?.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Solicitud recibida: {new Date(appointment.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(appointment)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-700 hover:bg-red-50"
                      onClick={() => handleReject(appointment)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Fecha:</span>
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Horario:</span>
                      <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Motivo:</span>
                      <span>{appointment.reason || 'No especificado'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{appointment.Patient?.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{appointment.Patient?.phone}</span>
                    </div>
                    {appointment.notes && (
                      <div>
                        <span className="font-medium">Notas:</span>
                        <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Aprobación */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprobar Solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={approvalData.date}
                onChange={(e) => setApprovalData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={approvalData.startTime}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={approvalData.endTime}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="professional">Profesional</Label>
              <select
                id="professional"
                value={approvalData.professionalId}
                onChange={(e) => setApprovalData(prev => ({ ...prev, professionalId: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar profesional</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} {prof.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={approvalData.notes}
                onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval}>
              Aprobar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rechazo */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Motivo del rechazo *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionData.rejectionReason}
                onChange={(e) => setRejectionData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                placeholder="Explica el motivo del rechazo..."
                required
              />
            </div>
            <div>
              <Label htmlFor="alternativeOptions">Opciones alternativas</Label>
              <Textarea
                id="alternativeOptions"
                value={rejectionData.alternativeOptions}
                onChange={(e) => setRejectionData(prev => ({ ...prev, alternativeOptions: e.target.value }))}
                placeholder="Sugiere horarios o fechas alternativas..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejection}
              disabled={!rejectionData.rejectionReason.trim()}
            >
              Rechazar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 