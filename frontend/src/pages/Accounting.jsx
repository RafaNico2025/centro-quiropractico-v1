import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { NewIncomeForm } from "../components/NewIncomeForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { incomeService } from "../services/income.service";

export default function Accounting() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewIncome, setOpenNewIncome] = useState(false);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);
    const startDate = today;
    const endDate = today;
    try {
      const data = await incomeService.getByDateRange(startDate, endDate);
      setTransactions(data);
    } catch (error) {
      // Puedes mostrar un toast de error si lo deseas
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Contabilidad</h1>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline">Exportar Reporte</Button> */}
          <Button onClick={() => setOpenNewIncome(true)}>Nuevo Ingreso</Button>
        </div>
      </div>

      {/* Modal de nuevo ingreso */}
      <NewIncomeForm
        open={openNewIncome}
        onOpenChange={setOpenNewIncome}
        onSuccess={fetchTransactions}
      />

      {/* <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        ...estadísticas...
      </div> */}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div>Cargando...</div>
              ) : transactions.length === 0 ? (
                <div>No hay transacciones recientes.</div>
              ) : (
                transactions.slice(0, 5).map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      {/* Ahora accedes a la relación sin alias */}
                      <p className="font-medium">
                        {income.Patient?.firstName || "Sin paciente"}{" "}
                        {/* paciente relacionado */}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {
                          (() => {
                            const d = new Date(income.date);
                            d.setDate(d.getDate() + 1);
                            return d.toLocaleDateString();
                          })()
                        } |
                        Tipo: {income.category || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${income.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {income.status === "paid" ||
                        income.paymentStatus === "completed"
                          ? "Pagado"
                          : income.status === "pending" ||
                            income.paymentStatus === "pending"
                          ? "Pendiente"
                          : income.status === "partial" ||
                            income.paymentStatus === "partial"
                          ? "Parcial"
                          : "Cancelado"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
