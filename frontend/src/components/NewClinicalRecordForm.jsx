import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { medicalHistoryService } from '../services/medicalHistory.service'
import { patientService } from '../services/patient.service'
import { useToast } from './ui/use-toast'

const initialFormData = {
  patientId: '',
  appointmentId: '' || null,
  professionalId: 1,
  diagnosis: '',
  treatment: '',
  observations: '',
  medications: '',
  allergies: '',
  previousConditions: '',
  familyHistory: ''
}

export function NewClinicalRecordForm({ open, onOpenChange, onSuccess, onPatientsUpdate }) {
  const [formData, setFormData] = useState(initialFormData)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    setLoadingPatients(true)
    patientService.getAll()
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false))
  }, [open, onPatientsUpdate])

  // Limpia el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) setFormData(initialFormData)
  }, [open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await medicalHistoryService.create(formData)
      toast({
        title: "Éxito",
        description: "Registro clínico creado correctamente"
      })
      setFormData(initialFormData) // <-- Limpia el formulario aquí
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el registro clínico",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Nuevo Registro Clínico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente</Label>
            <select
              id="patientId"
              name="patientId"
              required
              value={formData.patientId}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              disabled={loadingPatients}
            >
              <option value="">Seleccione un paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (DNI: {p.dni})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamiento</Label>
            <Textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos</Label>
            <Input
              id="medications"
              name="medications"
              value={formData.medications}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Input
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="previousConditions">Condiciones Previas</Label>
            <Input
              id="previousConditions"
              name="previousConditions"
              value={formData.previousConditions}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyHistory">Historial Familiar</Label>
            <Input
              id="familyHistory"
              name="familyHistory"
              value={formData.familyHistory}
              onChange={handleChange}
            />
          </div>
          {/* Puedes agregar campos para appointmentId y professionalId si lo necesitas */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingPatients}>
              {loading ? "Creando..." : "Crear Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}