import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { NewIncomeForm } from "../components/NewIncomeForm";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { incomeService } from "../services/income.service";

// Función helper para obtener la fecha de hoy en formato YYYY-MM-DD sin problemas de zona horaria
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función helper para obtener cualquier fecha en formato YYYY-MM-DD sin problemas de zona horaria
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Accounting() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewIncome, setOpenNewIncome] = useState(false);
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [showDateFilter, setShowDateFilter] = useState(false);
  const navigate = useNavigate();

  const fetchTransactions = async (customStartDate = null, customEndDate = null) => {
    setLoading(true);
    const start = customStartDate || startDate;
    const end = customEndDate || endDate;
    try {
      const data = await incomeService.getByDateRange(start, end);
      setTransactions(data);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = getTodayString();
    setStartDate(today);
    setEndDate(today);
    fetchTransactions(today, today);
  }, []);

  const handleDateFilter = () => {
    fetchTransactions();
  };

  const resetToToday = () => {
    const today = getTodayString();
    setStartDate(today);
    setEndDate(today);
    fetchTransactions(today, today);
  };

  const setThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    
    const startDateStr = getDateString(startOfWeek);
    const endDateStr = getDateString(endOfWeek);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    fetchTransactions(startDateStr, endDateStr);
  };

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDateStr = getDateString(startOfMonth);
    const endDateStr = getDateString(endOfMonth);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    fetchTransactions(startDateStr, endDateStr);
  };

  const getTotalAmount = () => {
    return transactions.reduce((total, transaction) => {
      return total + parseFloat(transaction.amount || 0);
    }, 0);
  };

  const getPendingAmount = () => {
    return transactions
      .filter((transaction) => transaction.status === 'pending')
      .reduce((total, transaction) => {
        return total + parseFloat(transaction.amount || 0);
      }, 0);
  };

  const formatDateRange = () => {
    if (startDate === endDate) {
      // Create the date correctly to avoid timezone issues
      const [year, month, day] = startDate.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 because months are 0-11
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // For date ranges, also use the safe method
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(endYear, endMonth - 1, endDay);
    
    return `${startDateObj.toLocaleDateString('es-ES')} - ${endDateObj.toLocaleDateString('es-ES')}`;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Contabilidad</h1>
        </div>
        <Button onClick={() => setOpenNewIncome(true)}>
          Nuevo Ingreso
        </Button>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtro de Fechas</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                >
                  {showDateFilter ? "Ocultar Filtro" : "Mostrar Filtro"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToToday}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setThisWeek}
                >
                  Esta Semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setThisMonth}
                >
                  Este Mes
                </Button>
              </div>
            </div>
          </CardHeader>
          {showDateFilter && (
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button onClick={handleDateFilter} className="px-6">
                  Filtrar
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${getTotalAmount().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total Recaudado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">${getPendingAmount().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pendiente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Transacciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de nuevo ingreso */}
      <NewIncomeForm
        open={openNewIncome}
        onOpenChange={setOpenNewIncome}
        onSuccess={() => {
          setOpenNewIncome(false);
          fetchTransactions();
        }}
        onPatientsUpdate={() => {}}
      />

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transacciones - {formatDateRange()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div>Cargando...</div>
            ) : transactions.length === 0 ? (
              <div>No hay transacciones en el período seleccionado.</div>
            ) : (
              transactions.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {income.Patient?.firstName || "Sin paciente"}{" "}
                      {income.Patient?.lastName || ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {new Date(income.date).toLocaleDateString('es-ES')} | 
                      Tipo: {income.category || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${parseFloat(income.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {income.status === 'completed' ? 'Pagado' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
