import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { Calendar } from '../components/ui/calendar'
import { DatePicker } from '../components/ui/date-picker'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card'
import { Skeleton } from '../components/ui/skeleton'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Stats() {
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

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
          <DatePicker
            date={date}
            onDateChange={setDate}
          />
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pacientes por Mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[100px] w-full" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">45</div>
                        <div className="mt-4 flex items-center space-x-2">
                          <Progress value={12} className="w-full" />
                          <span className="text-xs text-muted-foreground">+12%</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Detalles de Crecimiento</h4>
                  <p className="text-sm">
                    Incremento de 5 pacientes respecto al mes anterior.
                    La tasa de crecimiento se mantiene estable.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tratamientos Comunes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <Skeleton className="h-[150px] w-full" />
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Ajuste cervical</span>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Ajuste lumbar</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Terapia manual</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Satisfacción del Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[100px] w-full" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">4.8/5</div>
                        <div className="mt-4 flex items-center space-x-2">
                          <Progress value={96} className="w-full" />
                          <span className="text-xs text-muted-foreground">96%</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Detalles de Satisfacción</h4>
                  <p className="text-sm">
                    Basado en 150 evaluaciones este mes.
                    Los pacientes destacan la atención personalizada y el seguimiento post-tratamiento.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Nuevos Pacientes</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Citas Totales</p>
                    <p className="text-2xl font-bold">145</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Tasa de Asistencia</p>
                    <p className="text-2xl font-bold">95%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                    <p className="text-2xl font-bold">$45,250</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pacientes">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pacientes por Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">18-25 años</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">26-35 años</span>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">36-45 años</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">46+ años</span>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Referencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Recomendación</span>
                          <span className="text-sm font-medium">40%</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Internet</span>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Redes Sociales</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Otros</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finanzas">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">$45,250</div>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      +15% respecto al mes anterior
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio por Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">$1,250</div>
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Basado en 145 sesiones este mes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasa de Cobranza</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold">98%</div>
                    <Progress value={98} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      2% pendiente de cobro
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