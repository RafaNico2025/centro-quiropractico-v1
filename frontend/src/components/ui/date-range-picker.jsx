import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "@radix-ui/react-icons"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  className,
  placeholder = "Seleccionar rango de fechas" 
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const formatDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: es })}`
    }
    if (dateRange?.from) {
      return format(dateRange.from, "dd/MM/yyyy", { locale: es })
    }
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange() || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Indicador de estado de selección */}
        {dateRange?.from && !dateRange?.to && (
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-700">
              📅 <strong>Fecha de inicio seleccionada:</strong> {format(dateRange.from, "dd/MM/yyyy", { locale: es })}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Ahora selecciona la fecha de fin del rango
            </p>
          </div>
        )}
        
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            onDateRangeChange(range)
            // Cerrar el popover cuando se selecciona un rango completo
            if (range?.from && range?.to) {
              setIsOpen(false)
            }
          }}
          numberOfMonths={2}
          initialFocus
          locale={es}
        />
        <div className="p-3 border-t">
          <div className="text-xs text-gray-600 mb-3">
            💡 <strong>Instrucciones:</strong> Haz clic en el día de inicio, luego en el día de fin para seleccionar tu rango personalizado.
          </div>
          <div className="text-xs text-gray-500 mb-3">
            O usa estos atajos rápidos:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                onDateRangeChange({ from: lastWeek, to: today })
                setIsOpen(false)
              }}
            >
              Última semana
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
                onDateRangeChange({ from: lastMonth, to: endOfLastMonth })
                setIsOpen(false)
              }}
            >
              Mes pasado
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                onDateRangeChange({ from: firstDayOfMonth, to: today })
                setIsOpen(false)
              }}
            >
              Este mes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
                onDateRangeChange({ from: threeMonthsAgo, to: today })
                setIsOpen(false)
              }}
            >
              Últimos 3 meses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
                onDateRangeChange({ from: oneYearAgo, to: today })
                setIsOpen(false)
              }}
            >
              Último año
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 