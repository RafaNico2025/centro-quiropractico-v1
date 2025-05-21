import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const statusColors = {
  scheduled: '#93C5FD', // bg-blue-100
  completed: '#86EFAC', // bg-green-100
  cancelled: '#FCA5A5', // bg-red-100
  no_show: '#FDE68A',   // bg-yellow-100
  rescheduled: '#E9D5FF' // bg-purple-100
}

export function AppointmentCalendar({ appointments, onSelectEvent }) {
  // Convertir los appointments al formato que espera react-big-calendar
  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.Patient?.firstName} ${appointment.Patient?.lastName} - ${appointment.reason}`,
    start: new Date(`${appointment.date}T${appointment.startTime}`),
    end: new Date(`${appointment.date}T${appointment.endTime}`),
    status: appointment.status,
    resource: appointment
  }))

  // Personalizar el estilo de los eventos según su estado
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: statusColors[event.status],
        border: 'none'
      }
    }
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        views={['month', 'week', 'day']}
        messages={{
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          noEventsInRange: 'No hay citas en este período'
        }}
        defaultView="week"
      />
    </div>
  )
} 