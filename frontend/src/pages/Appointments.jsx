import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function Appointments() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Citas</h1>
        <Button>Nueva Cita</Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citas de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Juan Pérez</p>
                    <p className="text-sm text-muted-foreground">
                      10:00 AM - Consulta de seguimiento
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Confirmar</Button>
                    <Button variant="outline">Cancelar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">María González</p>
                    <p className="text-sm text-muted-foreground">
                      Mañana - 2:30 PM - Ajuste cervical
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Reagendar</Button>
                    <Button variant="outline">Cancelar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-lg border p-2 hover:bg-accent"
                >
                  <div className="text-sm font-medium">{index + 1}</div>
                  <div className="mt-1 space-y-1">
                    {index % 3 === 0 && (
                      <div className="rounded bg-primary/10 p-1 text-xs">
                        10:00 AM - Juan Pérez
                      </div>
                    )}
                    {index % 4 === 0 && (
                      <div className="rounded bg-primary/10 p-1 text-xs">
                        2:30 PM - María González
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 