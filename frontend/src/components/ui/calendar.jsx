import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

const WEEKDAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']

function Calendar({
  className = "",
  selected,
  onSelect,
  mode = "single", // "single" o "range"
  numberOfMonths = 1,
  ...props
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoverDate, setHoverDate] = useState(null)
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convertir domingo (0) a 6
  }
  
  const getDaysArray = (date) => {
    const daysInMonth = getDaysInMonth(date)
    const firstDay = getFirstDayOfMonth(date)
    const daysInPrevMonth = getDaysInMonth(new Date(date.getFullYear(), date.getMonth() - 1))
    
    const days = []
    
    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(date.getFullYear(), date.getMonth() - 1, daysInPrevMonth - i)
      })
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(date.getFullYear(), date.getMonth(), day)
      })
    }
    
    // Días del siguiente mes
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(date.getFullYear(), date.getMonth() + 1, day)
      })
    }
    
    return days
  }
  
  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }
  
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }
  
  const isSelected = (date) => {
    if (!selected) return false
    
    if (mode === "single") {
      return isSameDay(date, selected)
    }
    
    if (mode === "range") {
      if (selected.from && selected.to) {
        return isSameDay(date, selected.from) || isSameDay(date, selected.to)
      }
      if (selected.from) {
        return isSameDay(date, selected.from)
      }
    }
    
    return false
  }
  
  const isInRange = (date) => {
    if (mode !== "range" || !selected?.from || !selected?.to) return false
    
    // Normalizar las fechas a medianoche para comparar solo días
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const fromOnly = new Date(selected.from.getFullYear(), selected.from.getMonth(), selected.from.getDate())
    const toOnly = new Date(selected.to.getFullYear(), selected.to.getMonth(), selected.to.getDate())
    
    return dateOnly >= fromOnly && dateOnly <= toOnly
  }
  
  const isRangeStart = (date) => {
    if (mode !== "range" || !selected?.from) return false
    return isSameDay(date, selected.from)
  }
  
  const isRangeEnd = (date) => {
    if (mode !== "range" || !selected?.to) return false
    return isSameDay(date, selected.to)
  }
  
  const isRangeHover = (date, hoverDate) => {
    if (mode !== "range" || !selected?.from || selected?.to || !hoverDate) return false
    
    // Normalizar las fechas a medianoche para comparar solo días
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const fromOnly = new Date(selected.from.getFullYear(), selected.from.getMonth(), selected.from.getDate())
    const hoverOnly = new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate())
    
    const start = hoverOnly < fromOnly ? hoverOnly : fromOnly
    const end = hoverOnly < fromOnly ? fromOnly : hoverOnly
    
    return dateOnly >= start && dateOnly <= end
  }
  
  const handleDayClick = (dayObj) => {
    if (!onSelect) return
    
    if (mode === "single") {
      onSelect(dayObj.date)
    } else if (mode === "range") {
      // Resetear hover cuando se hace clic
      setHoverDate(null)
      
      if (!selected?.from || (selected?.from && selected?.to)) {
        // Si no hay fecha inicial o ya hay un rango completo, empezar nuevo rango
        onSelect({ from: dayObj.date, to: null })
      } else if (selected?.from && !selected?.to) {
        // Si hay fecha inicial pero no final, completar el rango
        const startDate = selected.from
        const endDate = dayObj.date
        
        // Normalizar fechas para comparar solo días
        const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        
        if (endOnly.getTime() === startOnly.getTime()) {
          // Si se hace clic en la misma fecha, resetear
          onSelect({ from: null, to: null })
        } else {
          // Asegurar que from sea la fecha menor y to la mayor
          if (endOnly >= startOnly) {
            onSelect({ from: startDate, to: endDate })
          } else {
            onSelect({ from: endDate, to: startDate })
          }
        }
      }
    }
  }
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  const renderMonth = (monthDate, index) => {
    const days = getDaysArray(monthDate)
    
    return (
      <div key={index} className="bg-white border rounded-lg shadow-sm p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900 capitalize">
            {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
          </h2>
          {index === 0 && (
            <div className="flex items-center gap-1">
              <button 
                onClick={goToPrevMonth}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={goToNextMonth}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="text-gray-500 text-xs font-medium text-center py-2"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, dayIndex) => (
            <button
              key={dayIndex}
              onClick={() => {
                handleDayClick(dayObj)
              }}
              onMouseEnter={() => mode === "range" && setHoverDate(dayObj.date)}
              onMouseLeave={() => mode === "range" && setHoverDate(null)}
              className={`
                h-9 w-9 rounded text-sm font-normal transition-all duration-200 hover:bg-gray-100
                ${dayObj.isCurrentMonth 
                  ? 'text-gray-900' 
                  : 'text-gray-400'
                }
                ${isToday(dayObj.date) 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : ''
                }
                ${isSelected(dayObj.date) && !isToday(dayObj.date)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : ''
                }
                ${isInRange(dayObj.date) && !isSelected(dayObj.date) && !isToday(dayObj.date)
                  ? 'bg-blue-100 text-blue-900'
                  : ''
                }
                ${isRangeHover(dayObj.date, hoverDate) && !isSelected(dayObj.date) && !isToday(dayObj.date)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : ''
                }
                ${isRangeStart(dayObj.date) && !isToday(dayObj.date)
                  ? 'bg-blue-500 text-white'
                  : ''
                }
                ${isRangeEnd(dayObj.date) && !isToday(dayObj.date)
                  ? 'bg-blue-500 text-white'
                  : ''
                }
              `}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  // Para múltiples meses
  const months = []
  for (let i = 0; i < numberOfMonths; i++) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
    months.push(monthDate)
  }
  
  return (
    <div className={`flex gap-4 ${className}`}>
      {months.map((monthDate, index) => renderMonth(monthDate, index))}
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }