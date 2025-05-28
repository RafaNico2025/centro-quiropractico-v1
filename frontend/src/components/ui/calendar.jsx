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
  ...props
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
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
  
  const isSelected = (date) => {
    if (!selected) return false
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear()
  }
  
  const handleDayClick = (dayObj) => {
    if (onSelect) {
      onSelect(dayObj.date)
    }
  }
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  
  const days = getDaysArray(currentDate)
  
  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-900 capitalize">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
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
        {days.map((dayObj, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(dayObj)}
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
            `}
          >
            {dayObj.day}
          </button>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }