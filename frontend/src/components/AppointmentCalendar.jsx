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
  cancelled: '#FCA5A5', // bg-red-100 (solo para mostrar si es necesario)
  no_show: '#FDE68A',   // bg-yellow-100
  rescheduled: '#E9D5FF' // bg-purple-100
}

// Estilos personalizados para mejorar la visualización
const customCalendarStyles = {
  height: '100%',
  fontSize: '12px'
}

export function AppointmentCalendar({ appointments, onSelectEvent, showCancelled = false }) {
  // Filtrar las citas - por defecto no mostrar las canceladas
  const filteredAppointments = appointments.filter(appointment => {
    if (showCancelled) {
      return true; // Mostrar todas las citas
    }
    return appointment.status !== 'cancelled'; // Ocultar citas canceladas
  });

  // Convertir los appointments filtrados al formato que espera react-big-calendar
  const events = filteredAppointments.map(appointment => {
    const startTime = format(new Date(`${appointment.date}T${appointment.startTime}`), 'HH:mm');
    const endTime = format(new Date(`${appointment.date}T${appointment.endTime}`), 'HH:mm');
    
    return {
      id: appointment.id,
      title: `${startTime} - ${endTime}\n${appointment.Patient?.firstName} ${appointment.Patient?.lastName}\n${appointment.reason || 'Sin motivo especificado'}`,
      start: new Date(`${appointment.date}T${appointment.startTime}`),
      end: new Date(`${appointment.date}T${appointment.endTime}`),
      status: appointment.status,
      resource: appointment,
      // Datos adicionales para mostrar en el tooltip
      patientName: `${appointment.Patient?.firstName} ${appointment.Patient?.lastName}`,
      reason: appointment.reason || 'Sin motivo especificado',
      timeRange: `${startTime} - ${endTime}`
    }
  });

  // Personalizar el estilo de los eventos según su estado
  const eventStyleGetter = (event) => {
    const baseStyle = {
      backgroundColor: statusColors[event.status],
      border: '1px solid #ccc',
      borderRadius: '4px',
      opacity: event.status === 'cancelled' ? 0.5 : 1,
      textDecoration: event.status === 'cancelled' ? 'line-through' : 'none',
      fontSize: '11px',
      padding: '2px 4px',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      zIndex: 1
    };

    return {
      style: baseStyle
    };
  };

  // Personalizar el formato de tiempo en el calendario - CLAVE: esto controla el gutter izquierdo
  const formats = {
    timeGutterFormat: (date, culture, localizer) => {
      // Mostrar solo los horarios cada 15 minutos que terminan en :00, :15, :30, :45
      const minutes = date.getMinutes();
      if (minutes % 15 === 0) {
        return localizer.format(date, 'HH:mm', culture);
      }
      return '';
    },
    eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    },
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }, culture, localizer) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    },
    selectRangeFormat: ({ start, end }, culture, localizer) => {
      return `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`;
    }
  };

  // Personalizar los componentes del evento
  const EventComponent = ({ event }) => {
    return (
      <div style={{ 
        height: '100%', 
        padding: '1px 3px', 
        fontSize: '9px',
        lineHeight: '1.1',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '1px',
          color: '#1f2937',
          fontSize: '9px'
        }}>
          {event.timeRange}
        </div>
        <div style={{ 
          marginBottom: '1px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '8px'
        }}>
          {event.patientName}
        </div>
        <div style={{ 
          fontSize: '7px', 
          opacity: 0.7,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: '#6b7280'
        }}>
          {event.reason}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Estilos CSS personalizados */}
      <style jsx>{`
        .rbc-calendar {
          font-size: 12px;
        }
        .rbc-time-slot {
          border-bottom: 1px solid #e5e7eb;
          min-height: 20px;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid #d1d5db;
          min-height: 80px;
        }
        .rbc-time-gutter {
          width: 70px;
        }
        .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid #d1d5db;
        }
        .rbc-time-gutter .rbc-time-slot {
          border-bottom: 1px solid #e5e7eb;
          font-size: 10px;
          color: #6b7280;
          text-align: right;
          padding-right: 8px;
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .rbc-time-header-gutter {
          background-color: #f9fafb;
          width: 70px;
        }
        .rbc-time-header .rbc-header {
          border-bottom: 2px solid #d1d5db;
          background-color: #f3f4f6;
          font-weight: 600;
          padding: 8px;
        }
        .rbc-event {
          border-radius: 3px;
          padding: 1px;
          margin: 0px;
          position: relative;
          z-index: 2;
        }
        .rbc-event:hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          z-index: 3;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }
        .rbc-day-slot {
          position: relative;
        }
        .rbc-events-container {
          position: relative;
          z-index: 1;
        }
        .rbc-time-column {
          min-height: 1200px;
        }
        .calendar-container {
          position: relative;
          z-index: 1;
        }
        .calendar-info {
          position: relative;
          z-index: 2;
          clear: both;
          margin-top: 16px;
        }
        .calendar-legend {
          position: relative;
          z-index: 2;
          clear: both;
          margin-top: 16px;
        }
      `}</style>
      
      <div className="calendar-container">
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={customCalendarStyles}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={onSelectEvent}
            views={['month', 'week', 'day']}
            step={15} // Intervalos de 15 minutos
            timeslots={1} // 1 slot por cada step (15 minutos)
            min={new Date(0, 0, 0, 7, 0, 0)} // Inicia a las 7:00 AM
            max={new Date(0, 0, 0, 20, 0, 0)} // Termina a las 8:00 PM
            formats={formats}
            components={{
              event: EventComponent
            }}
            messages={{
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              noEventsInRange: 'No hay citas en este período',
              showMore: (total) => `+ ${total} más`
            }}
            defaultView="week"
            popup={true}
            popupOffset={30}
            dayLayoutAlgorithm="no-overlap"
            scrollToTime={new Date(0, 0, 0, 8, 0, 0)} // Scroll inicial a las 8:00 AM
            selectable={true}
            longPressThreshold={250}
          />
        </div>
        
        {/* Leyenda de estados */}
        <div className="calendar-legend">
          <div className="flex flex-wrap gap-4 text-sm bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.scheduled }}></div>
              <span>Programado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.completed }}></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.rescheduled }}></div>
              <span>Reagendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: statusColors.no_show }}></div>
              <span>No asistió</span>
            </div>
            {showCancelled && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded opacity-50" style={{ backgroundColor: statusColors.cancelled }}></div>
                <span>Cancelado</span>
              </div>
            )}
          </div>
        </div>

        {/* Información sobre los intervalos */}
        <div className="calendar-info">
          <div className="text-xs text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 text-base">⏰</span>
              <strong className="text-blue-800">Configuración del calendario:</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
              <div className="flex items-center gap-1">
                <span className="text-blue-600">•</span>
                <strong>Intervalos:</strong> 15 minutos
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600">•</span>
                <strong>Horario:</strong> 7:00 AM - 8:00 PM
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600">•</span>
                <strong>Duración mínima:</strong> 15 minutos
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="text-xs text-gray-600 bg-white p-3 rounded border border-blue-100">
                <strong className="text-green-700">✅ Citas consecutivas permitidas:</strong>
                <div className="mt-1 space-y-1 text-xs">
                  <div>• 12:00-12:15 ➔ 12:15-12:30 ✅</div>
                  <div>• 14:30-14:45 ➔ 14:45-15:00 ✅</div>
                  <div>• 16:00-16:30 ➔ 16:30-16:45 ✅</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border border-blue-100">
                <strong className="text-red-700">❌ Superposiciones no permitidas:</strong>
                <div className="mt-1 space-y-1 text-xs">
                  <div>• 12:00-12:15 ➔ 12:10-12:25 ❌</div>
                  <div>• 14:30-14:45 ➔ 14:40-15:00 ❌</div>
                  <div>• 16:00-16:30 ➔ 16:15-16:45 ❌</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
              <strong>💡 Tip:</strong> Ahora puedes agendar citas una tras otra sin espacio entre ellas. 
              Si una cita termina a las 14:45, inmediatamente puedes agendar otra que comience a las 14:45.
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 