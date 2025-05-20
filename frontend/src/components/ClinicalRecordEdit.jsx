import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { medicalHistoryService } from '../services/medicalHistory.service'
import { useToast } from './ui/use-toast'

export function ClinicalRecordEdit({ open, onOpenChange, recordId, onSuccess }) {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    observations: '',
    medications: '',
    allergies: '',
    previousConditions: '',
    familyHistory: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !recordId) return
    setLoadingData(true)
    medicalHistoryService.getById(recordId)
      .then(data => setFormData({
        diagnosis: data.diagnosis || '',
        treatment: data.treatment || '',
        observations: data.observations || '',
        medications: data.medications || '',
        allergies: data.allergies || '',
        previousConditions: data.previousConditions || '',
        familyHistory: data.familyHistory || ''
      }))
      .catch(() => toast({ title: "Error", description: "No se pudo cargar el registro clínico", variant: "destructive" }))
      .finally(() => setLoadingData(false))
  }, [open, recordId])

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
      await medicalHistoryService.update(recordId, formData)
      toast({ title: "Éxito", description: "Registro clínico actualizado correctamente" })
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el registro clínico",
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
          <DialogTitle>Editar Registro Clínico</DialogTitle>
        </DialogHeader>
        {loadingData ? (
          <div>Cargando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Input
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment">Tratamiento</Label>
              <Input
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Input
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}