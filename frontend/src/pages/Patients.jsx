import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { patientService } from '../services/patient.service'
import { NewPatientForm } from '../components/NewPatientForm'
import { PatientDetail } from '../components/PatientDetail'
import { PatientEdit } from '../components/PatientEdit'

export default function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getAll()
        setPatients(data)
        console.log('Pacientes:', data) // Aquí ves si trae datos
      } catch (error) {
        console.error('Error al obtener pacientes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  // Refresca la lista después de crear o editar un paciente
  const handleSuccess = () => {
    setLoading(true)
    patientService.getAll().then(setPatients).finally(() => setLoading(false))
  }

  return (
    <div className="container mx-auto p-6">
      <NewPatientForm
        open={openForm}
        onOpenChange={setOpenForm}
        onSuccess={handleSuccess}
      />
      <PatientDetail
        open={openDetail}
        onOpenChange={setOpenDetail}
        patientId={selectedPatientId}
      />
      <PatientEdit
        open={openEdit}
        onOpenChange={setOpenEdit}
        patientId={selectedPatientId}
        onSuccess={handleSuccess}
      />
      <div className="flex items-center justify-between">
        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Pacientes</h1>
        <Button onClick={() => setOpenForm(true)}>Nuevo Paciente</Button>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div>Cargando...</div>
              ) : patients.length === 0 ? (
                <div>No hay pacientes registrados.</div>
              ) : (
                patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">DNI: {patient.dni}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPatientId(patient.id)
                          setOpenDetail(true)
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPatientId(patient.id)
                          setOpenEdit(true)
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}