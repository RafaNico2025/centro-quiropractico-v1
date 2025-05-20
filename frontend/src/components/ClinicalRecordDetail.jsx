import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { medicalHistoryService } from '../services/medicalHistory.service'

export function ClinicalRecordDetail({ open, onOpenChange, recordId }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !recordId) return
    setLoading(true)
    medicalHistoryService.getById(recordId)
      .then(setRecord)
      .catch(() => setRecord(null))
      .finally(() => setLoading(false))
  }, [open, recordId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-none tracking-tight">Detalle del Registro Clínico</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Cargando...</div>
        ) : !record ? (
          <div>No se encontró el registro clínico.</div>
        ) : (
          <div className="space-y-2">
            <div><strong>Fecha de creación:</strong> {record.createdAt}</div>
            <div><strong>Diagnóstico:</strong> {record.diagnosis}</div>
            <div><strong>Tratamiento:</strong> {record.treatment}</div>
            <div><strong>Observaciones:</strong> {record.observations}</div>
            <div><strong>Medicamento:</strong> {record.medications}</div>
            <div><strong>Alergias:</strong> {record.allergies}</div>
            <div><strong>Condiciones previas:</strong> {record.previousConditions}</div>
            <div><strong>Historial familiar:</strong> {record.familyHistory}</div>
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