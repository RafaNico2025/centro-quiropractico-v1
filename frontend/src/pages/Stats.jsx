import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { DateRangePicker } from '../components/ui/date-range-picker'
import { Button } from '../components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useToast } from '../components/ui/use-toast'
import { statsService } from '../services/stats.service'

export default function Stats() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
    to: new Date() // Hoy
  })
  const [isLoading, setIsLoading] = useState(true)
  const [generalStats, setGeneralStats] = useState(null)
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [patientStats, setPatientStats] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadAllStats()
  }, [])

  const loadAllStats = async () => {
    try {
      setIsLoading(true)
      
      // Cargar estadísticas generales
      const general = await statsService.getGeneral()
      setGeneralStats(general)

      // Cargar estadísticas de citas
      const appointments = await statsService.getAppointments()
      setAppointmentStats(appointments)

      // Cargar estadísticas de pacientes
      const patients = await statsService.getPatients()
      setPatientStats(patients)

    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateRangeChange = async (newDateRange) => {
    // Actualizar el estado del rango de fechas inmediatamente
    setDateRange(newDateRange)
    
    // Solo hacer la llamada a la API si tenemos un rango completo
    if (!newDateRange?.from || !newDateRange?.to) {
      return
    }
    
    try {
      setIsLoading(true)
      
      const startDate = newDateRange.from.toISOString().split('T')[0]
      const endDate = newDateRange.to.toISOString().split('T')[0]
      
      // Actualizar estadísticas generales con el nuevo rango
      const general = await statsService.getGeneral({ startDate, endDate })
      setGeneralStats(general)

      // Actualizar estadísticas de citas con el nuevo rango
      const appointments = await statsService.getAppointments({ startDate, endDate })
      setAppointmentStats(appointments)

      toast({
        title: "✅ Actualizado",
        description: `Estadísticas actualizadas para el período ${startDate} - ${endDate}`,
        duration: 2000
      })
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las estadísticas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadAllStats()
  }

  if (isLoading && !generalStats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando estadísticas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Estadísticas</h1>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            placeholder="Seleccionar período"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Mostrar el período seleccionado */}
      {generalStats?.periodo && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              📊 Mostrando estadísticas del período: 
              <span className="font-medium ml-1">
                {generalStats.periodo.inicio} - {generalStats.periodo.fin}
              </span>
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="citas">Citas</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Citas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{generalStats?.citas?.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      En el período seleccionado
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Citas Completadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {generalStats?.citas?.completadas || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pacientes atendidos
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasa de Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{generalStats?.citas?.tasaAsistencia || 0}%</div>
                    <div className="mt-2">
                      <Progress value={generalStats?.citas?.tasaAsistencia || 0} className="h-2" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nuevos Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      {generalStats?.pacientes?.nuevos || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      En el período
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completadas</span>
                    <span className="font-bold text-green-600">
                      {generalStats?.citas?.completadas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Programadas</span>
                    <span className="font-bold text-blue-600">
                      {generalStats?.citas?.programadas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Canceladas</span>
                    <span className="font-bold text-red-600">
                      {generalStats?.citas?.canceladas || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">No Asistieron</span>
                    <span className="font-bold text-yellow-600">
                      {generalStats?.citas?.noAsistio || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información del Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {generalStats?.periodo?.inicio} - {generalStats?.periodo?.fin}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pacientes</p>
                    <p className="font-medium">{generalStats?.pacientes?.total || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de Cancelación</p>
                    <p className="font-medium">{generalStats?.citas?.tasaCancelacion || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="citas" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-2">
                    {appointmentStats?.porMes?.slice(-6).map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{stat.mes}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">C: {stat.completadas}</span>
                          <span className="text-blue-600">P: {stat.programadas}</span>
                          <span className="text-red-600">X: {stat.canceladas}</span>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No hay datos disponibles</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Días de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-2">
                    {appointmentStats?.porDiaSemana?.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{stat.dia}</span>
                        <span className="font-bold">{stat.total}</span>
                      </div>
                    )) || <p className="text-muted-foreground">No hay datos disponibles</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pacientes" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pacientes Más Activos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-2">
                    {patientStats?.masActivos?.slice(0, 5).map((patient, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="font-bold">{patient.totalCitas} citas</span>
                      </div>
                    )) || <p className="text-muted-foreground">No hay datos disponibles</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {patientStats?.total || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total de pacientes</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Nuevos por mes (últimos 6)</p>
                      {patientStats?.nuevosPorMes?.slice(-6).map((stat, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{stat.mes}</span>
                          <span className="font-bold">{stat.nuevos}</span>
                        </div>
                      )) || <p className="text-muted-foreground">No hay datos disponibles</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finanzas" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos del Período</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      ${generalStats?.finanzas?.ingresosTotales?.toLocaleString() || 0}
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Ingresos totales del período
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio por Cita</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">
                      ${generalStats?.finanzas?.promedioPorCita?.toLocaleString() || 0}
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Basado en {generalStats?.citas?.completadas || 0} citas completadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 