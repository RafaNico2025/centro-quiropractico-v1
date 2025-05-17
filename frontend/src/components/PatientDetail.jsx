import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { patientService } from '../services/patient.service'

export function PatientDetail({ open, onOpenChange, patientId }) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !patientId) return
    setLoading(true)
    patientService.getById(patientId)
      .then(setPatient)
      .catch(() => setPatient(null))
      .finally(() => setLoading(false))
  }, [open, patientId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle del Paciente</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Cargando...</div>
        ) : !patient ? (
          <div>No se encontró el paciente.</div>
        ) : (
          <div className="space-y-2">
            <div><strong>Nombre:</strong> {patient.firstName} {patient.lastName}</div>
            <div><strong>DNI:</strong> {patient.dni}</div>
            <div><strong>Teléfono:</strong> {patient.phone}</div>
            <div><strong>Email:</strong> {patient.email}</div>
            <div><strong>Dirección:</strong> {patient.address}</div>
            <div><strong>Fecha de nacimiento:</strong> {patient.birthDate}</div>
            <div><strong>Género:</strong> {patient.gender}</div>
            <div><strong>Contacto de emergencia:</strong> {patient.emergencyContact}</div>
            <div><strong>Teléfono de emergencia:</strong> {patient.emergencyPhone}</div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}