import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { DateRangePicker } from '../components/ui/date-range-picker'
import { Button } from '../components/ui/button'
import { ArrowLeft, RefreshCw, FileSpreadsheet } from 'lucide-react'
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

  const handleExportToExcel = async () => {
    try {
      setIsLoading(true);
      await statsService.exportToExcel({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0]
      });
      toast({
        title: "Éxito",
        description: "Las estadísticas se han exportado correctamente",
      });
    } catch (error) {
      console.error('Error al exportar estadísticas:', error);
      toast({
        title: "Error",
        description: "No se pudieron exportar las estadísticas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <Button variant="outline" onClick={handleExportToExcel} disabled={isLoading}>
            <FileSpreadsheet className="h-4 w-4" />
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
                  <div className="space-y-3">
                    {patientStats?.masActivos?.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          {patientStats.masActivos.slice(0, 5).map((patient, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">
                                  {patient.firstName} {patient.lastName}
                                </span>
                              </div>
                              <span className="font-bold text-blue-600">{patient.totalCitas} citas</span>
                            </div>
                          ))}
                        </div>
                        
                        {patientStats.masActivos.length < 5 && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📊</span>
                              <p className="text-sm text-blue-700">
                                <strong>Dataset pequeño:</strong> 
                                {patientStats.masActivos.length === 1 ? ' Solo 1 paciente activo' : 
                                 ` ${patientStats.masActivos.length} pacientes activos`} 
                                 {' '}en este período. Las métricas reflejan esta muestra.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-muted-foreground mb-2">No hay pacientes con citas en este período</p>
                        <p className="text-sm text-blue-600">Prueba seleccionar un rango de fechas más amplio</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {patientStats?.total || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total de pacientes registrados</p>
                    </div>
                    
                    {/* Métricas del período */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Con citas en período:</span>
                        <span className="font-bold">{patientStats?.masActivos?.length || 0}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Pacientes nuevos:</span>
                        <span className="font-bold text-green-600">
                          {generalStats?.pacientes?.nuevos || 0}
                        </span>
                      </div>
                      
                      {patientStats?.masActivos?.length > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Promedio citas/paciente:</span>
                            <span className="font-bold">
                              {Math.round((generalStats?.citas?.total || 0) / patientStats.masActivos.length * 10) / 10}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Paciente más activo:</span>
                            <span className="font-bold text-blue-600">
                              {Math.max(...patientStats.masActivos.map(p => p.totalCitas))} citas
                            </span>
                          </div>
                        </>
                      )}

                      {/* Métricas adicionales útiles */}
                      {generalStats?.citas && (
                        <>
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Tasa de retención:</span>
                              <span className="font-bold text-purple-600">
                                {patientStats?.masActivos?.length > 0 ? 
                                  Math.round(((patientStats.masActivos.filter(p => p.totalCitas > 1).length) / patientStats.masActivos.length) * 100) : 0}%
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Citas completadas:</span>
                              <span className="font-bold text-green-600">
                                {generalStats.citas.completadas || 0}
                              </span>
                            </div>
                            
                            {generalStats.citas.total > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Eficiencia de citas:</span>
                                <span className="font-bold">
                                  {Math.round((generalStats.citas.completadas / generalStats.citas.total) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Crecimiento histórico (solo si hay datos) */}
                    {patientStats?.nuevosPorMes?.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-2">Tendencia de nuevos pacientes:</p>
                        <div className="space-y-1">
                          {patientStats.nuevosPorMes.slice(-3).map((stat, index) => {
                            const isCurrentMonth = index === patientStats.nuevosPorMes.slice(-3).length - 1;
                            return (
                              <div key={index} className={`flex justify-between items-center text-sm p-2 rounded ${isCurrentMonth ? 'bg-green-50' : ''}`}>
                                <span className={isCurrentMonth ? 'font-medium' : ''}>{stat.mes}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isCurrentMonth ? 'text-green-600' : ''}`}>
                                    {stat.nuevos} nuevos
                                  </span>
                                  {isCurrentMonth && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">actual</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Insights útiles en lugar de sugerencias genéricas */}
                    {patientStats?.masActivos?.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-indigo-900 mb-2">📈 Insights del período:</h4>
                          <div className="text-xs text-indigo-700 space-y-1">
                            {patientStats.masActivos.filter(p => p.totalCitas > 1).length > 0 && (
                              <div>• {patientStats.masActivos.filter(p => p.totalCitas > 1).length} pacientes regresaron múltiples veces</div>
                            )}
                            {generalStats?.pacientes?.nuevos > 0 && (
                              <div>• {generalStats.pacientes.nuevos} pacientes nuevos captados en este período</div>
                            )}
                            {generalStats?.citas?.completadas > 0 && generalStats?.citas?.total > 0 && (
                              <div>• {Math.round((generalStats.citas.completadas / generalStats.citas.total) * 100)}% de las citas fueron completadas exitosamente</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                    <Progress 
                      value={generalStats?.finanzas?.ingresosTotales > 0 ? 
                        Math.min((generalStats.finanzas.ingresosTotales / 100000) * 100, 100) : 0
                      } 
                      className="h-2" 
                    />
                    <p className="text-sm text-muted-foreground">
                      {generalStats?.finanzas?.ingresosTotales > 0 ? 
                        'Ingresos totales del período' : 
                        'No hay ingresos en el período seleccionado'
                      }
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
                    <Progress 
                      value={generalStats?.finanzas?.promedioPorCita > 0 ? 
                        Math.min((generalStats.finanzas.promedioPorCita / 10000) * 100, 100) : 0
                      } 
                      className="h-2" 
                    />
                    <p className="text-sm text-muted-foreground">
                      {generalStats?.citas?.completadas > 0 ? 
                        `Basado en ${generalStats.citas.completadas} citas completadas` :
                        'No hay citas completadas en el período'
                      }
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