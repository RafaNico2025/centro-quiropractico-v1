import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { patientService } from '../services/patient.service'
import { NewPatientForm } from '../components/NewPatientForm'
import { PatientDetail } from '../components/PatientDetail'
import { PatientEdit } from '../components/PatientEdit'
import { useToast } from '../components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"

export default function Patients() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getAll(search)
        setPatients(data)
      } catch (error) {
        console.error('Error al obtener pacientes:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pacientes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [search])

  // Refresca la lista después de crear o editar un paciente
  const handleSuccess = () => {
    setLoading(true)
    patientService.getAll(search).then(setPatients).finally(() => setLoading(false))
  }

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await patientService.delete(patientToDelete.id)
      toast({
        title: "Paciente eliminado",
        description: "El paciente y sus registros relacionados han sido eliminados exitosamente",
      })
      handleSuccess() // Recargar la lista
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Barra de búsqueda */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido, DNI o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al paciente y todos sus registros relacionados (citas, historial clínico, etc.).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(patient)}
                      >
                        <Trash2 className="h-4 w-4" />
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