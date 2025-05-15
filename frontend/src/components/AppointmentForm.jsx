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

export function AppointmentForm({ open, onOpenChange, onSuccess }) {
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
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive"
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const appointmentData = {
        ...formData,
        date: formData.date,
        patientId: parseInt(formData.patientId),
        professionalId: parseInt(formData.professionalId)
      }

      await appointmentService.create(appointmentData)
      toast({
        title: "Éxito",
        description: "Cita creada correctamente"
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          <DialogTitle>Nueva Cita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Inicio</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Hora de Fin</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              required
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente</Label>
            <Select
              value={formData.patientId.toString()}
              onValueChange={(value) => {
                console.log('Paciente seleccionado:', value);
                setFormData(prev => ({ ...prev, patientId: parseInt(value) }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.firstName} {patient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalId">Profesional</Label>
            <Select
              value={formData.professionalId.toString()}
              onValueChange={(value) => {
                console.log('Profesional seleccionado:', value);
                setFormData(prev => ({ ...prev, professionalId: parseInt(value) }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map(professional => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.name} {professional.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de la Consulta</Label>
            <Textarea
              id="reason"
              name="reason"
              required
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 