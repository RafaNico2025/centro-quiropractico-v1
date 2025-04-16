import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function ClinicalRecords() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Registros Clínicos</h1>
        <Button>Nuevo Registro</Button>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Historial Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Juan Pérez</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: 2024-03-20 | Tipo: Ajuste cervical
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Ver Detalles</Button>
                    <Button variant="outline">Editar</Button>
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