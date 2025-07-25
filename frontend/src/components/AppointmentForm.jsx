import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { appointmentService } from '../services/appointment.service'
import { userService } from '../services/user.service'
import { useToast } from './ui/use-toast'

export function AppointmentForm({ open, onOpenChange, onSuccess, appointment, onPatientsUpdate }) {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    notes: '',
    patientId: '',
    professionalId: ''
  })
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, professionalsData] = await Promise.all([
          userService.getPatients(),
          userService.getProfessionals()
        ])
        setPatients(patientsData)
        setProfessionals(professionalsData)
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar los datos necesarios",
          variant: "destructive"
        })
      } finally {
        setLoadingData(false)
      }
    }

    // Resetear el formulario cuando se abre
    const resetForm = {
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
      notes: '',
      patientId: '',
      professionalId: ''
    }

    if (open) {
      loadData()
      // Si hay una cita para editar, usar sus datos, sino usar el formulario vacío
      setFormData(appointment ? {
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        patientId: appointment.patientId.toString(),
        professionalId: appointment.professionalId.toString()
      } : resetForm)
      setErrors({}) // Limpiar errores al abrir
    }

    // Limpiar el formulario cuando se cierra
    return () => {
      if (!open) {
        setFormData({
          date: '',
          startTime: '',
          endTime: '',
          reason: '',
          notes: '',
          patientId: '',
          professionalId: ''
        })
        setLoadingData(true)
        setErrors({}) // Limpiar errores al cerrar
      }
    }
  }, [open, appointment, onPatientsUpdate])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria'
    } else {
      // Usar comparación de strings para evitar problemas de zona horaria
      const todayString = new Date().toISOString().split('T')[0]
      
      console.log('🔥 DEBUGGING AppointmentForm - Validación fecha:', {
        fechaSeleccionada: formData.date,
        fechaHoy: todayString,
        comparacion: `"${formData.date}" >= "${todayString}" = ${formData.date >= todayString}`,
        esValida: formData.date >= todayString
      })
      
      if (formData.date < todayString) {
        newErrors.date = 'No se pueden crear citas en fechas pasadas'
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es obligatoria'
    } else {
      // Validar que la hora de inicio esté dentro del horario de atención
      const startTime = formData.startTime
      if (startTime < '07:00' || startTime > '19:45') {
        newErrors.startTime = 'La hora de inicio debe estar entre 7:00 AM y 7:45 PM'
      }
      
      // Validar que los minutos sean múltiplos de 15
      const minutes = parseInt(startTime.split(':')[1])
      if (minutes % 15 !== 0) {
        newErrors.startTime = 'La hora debe ser en intervalos de 15 minutos (ej: 09:00, 09:15, 09:30, 09:45)'
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La hora de fin es obligatoria'
    } else {
      // Validar que la hora de fin esté dentro del horario de atención
      const endTime = formData.endTime
      if (endTime < '07:15' || endTime > '20:00') {
        newErrors.endTime = 'La hora de fin debe estar entre 7:15 AM y 8:00 PM'
      }
      
      // Validar que los minutos sean múltiplos de 15
      const minutes = parseInt(endTime.split(':')[1])
      if (minutes % 15 !== 0) {
        newErrors.endTime = 'La hora debe ser en intervalos de 15 minutos (ej: 09:15, 09:30, 09:45, 10:00)'
      }
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'La hora de fin debe ser posterior a la de inicio'
      } else {
        // Validar duración mínima de 15 minutos
        const start = new Date(`2000-01-01T${formData.startTime}:00`)
        const end = new Date(`2000-01-01T${formData.endTime}:00`)
        const duration = (end - start) / (1000 * 60) // duración en minutos
        
        if (duration < 15) {
          newErrors.endTime = 'La cita debe durar al menos 15 minutos'
        }
        
        // Validar que la duración sea múltiplo de 15 minutos
        if (duration % 15 !== 0) {
          newErrors.endTime = 'La duración debe ser múltiplo de 15 minutos (15, 30, 45, 60, etc.)'
        }
      }
    }

    if (!formData.patientId) {
      newErrors.patientId = 'Debe seleccionar un paciente'
    }

    if (!formData.professionalId) {
      newErrors.professionalId = 'Debe seleccionar un profesional'
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = 'El motivo de la cita es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores del formulario",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        date: formData.date,
        patientId: parseInt(formData.patientId),
        professionalId: parseInt(formData.professionalId)
      }

      if (appointment) {
        if (appointment.date === formData.date && 
            appointment.startTime === formData.startTime && 
            appointment.endTime === formData.endTime) {
          toast({
            title: "Error",
            description: "Para reagendar una cita debes cambiar el día o el horario",
            variant: "destructive"
          })
          setLoading(false)
          return
        }

        await appointmentService.update(appointment.id, {
          ...appointmentData,
          status: 'rescheduled'
        })
        
        toast({
          title: "Éxito",
          description: "Cita reagendada correctamente"
        })
      } else {
        await appointmentService.create(appointmentData)
        toast({
          title: "Éxito",
          description: "Cita creada correctamente"
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si cambia la hora de inicio, sugerir automáticamente la hora de fin (15 minutos después)
    if (name === 'startTime' && value && !formData.endTime) {
      const startTime = new Date(`2000-01-01T${value}:00`)
      const endTime = new Date(startTime.getTime() + 15 * 60000) // Agregar 15 minutos
      const endTimeString = endTime.toTimeString().slice(0, 5)
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endTime: endTimeString
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario seleccione
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex items-center justify-center p-6">
            Cargando...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Reagendar Cita' : 'Nueva Cita'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de inicio *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                step="900"
                min="07:00"
                max="20:00"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
              <p className="text-xs text-gray-500">Intervalos de 15 minutos (7:00 AM - 8:00 PM)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de fin *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                step="900" // 900 segundos = 15 minutos
                min="07:15"
                max="20:00"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
              <p className="text-xs text-gray-500">Mínimo 15 minutos de duración</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo *</Label>
              <Input
                id="reason"
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                placeholder="Ej: Consulta general, control..."
                className={errors.reason ? 'border-red-500' : ''}
              />
              {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleSelectChange('patientId', value)}
                required
              >
                <SelectTrigger className={errors.patientId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && <p className="text-sm text-red-600">{errors.patientId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionalId">Profesional *</Label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => handleSelectChange('professionalId', value)}
                required
              >
                <SelectTrigger className={errors.professionalId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar profesional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id.toString()}>
                      {professional.name} {professional.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.professionalId && <p className="text-sm text-red-600">{errors.professionalId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button
            type="submit" 
            disabled={loading}
            aria-label={appointment ? 'Reagendar cita' : 'Nueva cita'}
            >
              {loading ? 'Procesando...' : appointment ? 'Reagendar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 