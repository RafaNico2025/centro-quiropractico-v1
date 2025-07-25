import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { medicalHistoryService } from "../services/medicalHistory.service";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { NewClinicalRecordForm } from "../components/NewClinicalRecordForm";
import { ClinicalRecordDetail } from "../components/ClinicalRecordDetail";
import { ClinicalRecordEdit } from "../components/ClinicalRecordEdit";

export default function ClinicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const navigate = useNavigate();
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  // Define fetchRecords FUERA del useEffect
  const fetchRecords = async () => {
    try {
      const data = await medicalHistoryService.getAll();
      setRecords(data);
      console.log("Registros clínicos:", data);
    } catch (error) {
      console.error("Error al obtener registros clínicos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Registros Clínicos</h1>
        <Button onClick={() => setOpenForm(true)}>Nuevo Registro</Button>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Historial Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div>Cargando...</div>
              ) : records.length === 0 ? (
                <div>No hay registros clínicos.</div>
              ) : (
                records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">
                        {record.Patient?.firstName} {record.Patient?.lastName} |{" "}
                        {record.Patient?.dni}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registro clínico
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRecordId(record.id);
                          setOpenDetail(true);
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRecordId(record.id);
                          setOpenEdit(true);
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
      <NewClinicalRecordForm
        open={openForm}
        onOpenChange={setOpenForm}
        onSuccess={fetchRecords}
        onPatientsUpdate={fetchRecords}
      />
      <ClinicalRecordDetail
        open={openDetail}
        onOpenChange={setOpenDetail}
        recordId={selectedRecordId}
      />
      <ClinicalRecordEdit
        open={openEdit}
        onOpenChange={setOpenEdit}
        recordId={selectedRecordId}
        onSuccess={fetchRecords}
      />
    </div>
  );
}
