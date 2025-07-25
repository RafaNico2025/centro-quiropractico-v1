import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from './ui/use-toast'
import { patientService } from '../services/patient.service'
import { incomeService } from '../services/income.service'

const initialFormData = {
  patientId: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  description: '',
  paymentMethod: 'cash',
  category: 'consultation',
  discountAmount: 0,
  paymentStatus: 'completed',
  notes: ''
}

export function NewIncomeForm({ open, onOpenChange, onSuccess, onPatientsUpdate, selectedPatient }) {
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

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData)
    }
  }, [open])

  useEffect(() => {
    if (open && selectedPatient && patients.length > 0) {
      // Establecer el paciente cuando se abre el formulario con un paciente seleccionado y los pacientes están cargados
      console.log('Setting selected patient:', selectedPatient)
      setFormData(prev => ({
        ...prev,
        patientId: selectedPatient.id.toString()
      }))
    }
  }, [open, selectedPatient, patients.length])

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
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || 'unknown'

    const amount = parseFloat(formData.amount)
    const discountAmount = parseFloat(formData.discountAmount) || 0
    const netAmount = amount - discountAmount

    await incomeService.create({
      ...formData,
      amount,
      discountAmount,
      netAmount,
      recordedBy: userId
    })

    toast({ title: "Éxito", description: "Ingreso registrado correctamente" })
    setFormData(initialFormData)
    onSuccess?.()
    onOpenChange(false)
  } catch (error) {
    toast({
      title: "Error",
      description: error.message || "No se pudo crear el ingreso",
      variant: "destructive"
    })
  } finally {
    setLoading(false)
  }
}




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Nuevo Ingreso</DialogTitle>
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
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              required
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="consultation">Consulta</option>
              <option value="treatment">Tratamiento</option>
              <option value="product">Producto</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountAmount">Descuento</Label>
            <Input
              id="discountAmount"
              name="discountAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Estado de Pago</Label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              required
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
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
            <Button type="submit" disabled={loading || loadingPatients}>
              {loading ? "Guardando..." : "Registrar Ingreso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}