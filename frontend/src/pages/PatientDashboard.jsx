import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../services/appointment.service";
import { toast } from "../components/ui/use-toast";
import { userService } from "../services/user.service";
import api from "../services/api";
import { PatientEdit } from "../components/PatientEdit"; // Asegúrate de importar el componente

// Función helper para obtener la fecha de hoy en formato YYYY-MM-DD sin problemas de zona horaria
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointmentRequest, setAppointmentRequest] = useState({
    motivo: "",
    preferenciaDia: "",
    preferenciaHora: "",
    notas: "",
    fechaSeleccionada: "",
    horarioSeleccionado: ""
  });
  const [editOpen, setEditOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]); // Array para múltiples selecciones
  const [existingAppointments, setExistingAppointments] = useState([]); // Citas existentes del paciente

  const storedUser = user || JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Traer datos del usuario por ID (incluye paciente)
  const loadUserData = async () => {
    try {
      const response = await api.get(`/users/${storedUser.id}`);
      setUserData(response.data);
      setPatientData(response.data.Patient || null); // Guarda la data del paciente si existe
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  // 3. Traer appointments y filtrar por paciente
  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);

      if (userData) {
        const userName = userData.Nombre || userData.name;

        const filtered = data.filter(
          (appt) => {
            // Si el usuario tiene un patientId, usarlo para la comparación
            if (userData.patientId) {
              return appt.patientId === userData.patientId;
            }
            
            // Si no hay patientId, usar comparación de nombres (más flexible)
            const patientFirstName = appt.Patient?.firstName;
            const userName = userData.Nombre || userData.name;
            
            return (
              appt.Patient &&
              appt.Patient.firstName &&
              (appt.Patient.firstName.toLowerCase() === userName?.toLowerCase() ||
               appt.Patient.firstName.toLowerCase().includes(userName?.toLowerCase()))
            );
          }
        );

        setPatientAppointments(filtered);

        const now = new Date();
        const next = filtered
          .filter((a) => new Date(`${a.date}T${a.startTime}`) >= now)
          .sort(
            (a, b) =>
              new Date(`${a.date}T${a.startTime}`) -
              new Date(`${b.date}T${b.startTime}`)
          )[0];

        setNextAppointment(next);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar slots disponibles
  const loadAvailableSlots = async (date) => {
    if (!date) return;
    
    setLoadingSlots(true);
    try {
      const slotsData = await appointmentService.getAvailableSlots(date);
      setAvailableSlots(slotsData.slots || []);
      
      // También cargar las citas existentes del paciente para esta fecha
      if (userData) {
        const userName = userData.Nombre || userData.name;
        
        // Usar la misma lógica de comparación que en loadAppointments
        const patientAppointmentsForDate = appointments.filter(
          (appt) => {
            // Si el usuario tiene un patientId, usarlo para la comparación
            if (userData.patientId) {
              return appt.patientId === userData.patientId && 
                     appt.date === date &&
                     appt.status !== 'cancelled';
            }
            
            // Si no hay patientId, usar comparación de nombres (más flexible)
            return (
              appt.Patient &&
              appt.Patient.firstName &&
              (appt.Patient.firstName.toLowerCase() === userName?.toLowerCase() ||
               appt.Patient.firstName.toLowerCase().includes(userName?.toLowerCase())) &&
              appt.date === date &&
              appt.status !== 'cancelled'
            );
          }
        );
        
        setExistingAppointments(patientAppointmentsForDate);
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Función para manejar cambio de fecha
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlots([]); // Limpiar selecciones al cambiar fecha
    setAppointmentRequest(prev => ({
      ...prev,
      fechaSeleccionada: date,
      horarioSeleccionado: "" // Limpiar horario seleccionado
    }));
    
    // Cargar slots disponibles para la nueva fecha
    if (date) {
      loadAvailableSlots(date);
    } else {
      setAvailableSlots([]);
      setExistingAppointments([]);
    }
  };

  // Función para seleccionar/deseleccionar un horario
  const handleSlotSelection = (slot) => {
    const slotKey = `${slot.startTime}-${slot.endTime}`;
    
    setSelectedSlots(prev => {
      const isAlreadySelected = prev.some(s => `${s.startTime}-${s.endTime}` === slotKey);
      
      if (isAlreadySelected) {
        // Deseleccionar
        return prev.filter(s => `${s.startTime}-${s.endTime}` !== slotKey);
      } else {
        // Seleccionar (máximo 3)
        if (prev.length >= 3) {
          toast({
            title: "Límite alcanzado",
            description: "Puedes seleccionar máximo 3 horarios",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, slot];
      }
    });
  };

  // Función para verificar si un slot ya está ocupado por el paciente
  const isSlotOccupiedByPatient = (slot) => {
    const isOccupied = existingAppointments.some(appt => 
      appt.startTime === slot.startTime && 
      appt.endTime === slot.endTime &&
      appt.status !== 'cancelled'      // Solo excluir citas canceladas
    );
    
    return isOccupied;
  };

  // Función para verificar si un slot está ocupado por una cita reagendada del paciente
  const isSlotRescheduledByPatient = (slot) => {
    return existingAppointments.some(appt => 
      appt.startTime === slot.startTime && 
      appt.endTime === slot.endTime &&
      appt.status === 'rescheduled'
    );
  };

  // Función para obtener el color de un slot
  const getSlotColor = (slot) => {
    const slotKey = `${slot.startTime}-${slot.endTime}`;
    const isSelected = selectedSlots.some(s => `${s.startTime}-${s.endTime}` === slotKey);
    const isOccupied = isSlotOccupiedByPatient(slot);
    
    if (isOccupied) {
      return 'bg-gray-400 text-white border-gray-400 cursor-not-allowed'; // Gris para citas existentes
    } else if (isSelected) {
      return 'bg-blue-500 text-white border-blue-500'; // Azul para seleccionados
    } else {
      return 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'; // Normal
    }
  };

  // Función para generar todos los horarios del día (disponibles y ocupados)
  const getAllTimeSlots = () => {
    const slots = [];
    const startHour = 7;
    const endHour = 20;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 15;
        const endTimeHour = endMinute >= 60 ? hour + 1 : hour;
        const endTimeMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
        
        if (endTimeHour <= endHour) {
          slots.push({
            startTime,
            endTime,
            available: availableSlots.some(slot => 
              slot.startTime === startTime && slot.endTime === endTime
            )
          });
        }
      }
    }
    
    return slots;
  };

  // Cargar datos en orden
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      loadAppointments();
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar que todos los campos requeridos estén completos
      if (!appointmentRequest.motivo.trim() || !appointmentRequest.fechaSeleccionada || selectedSlots.length === 0) {
        toast({
          title: "Error",
          description: "Por favor completa el motivo, selecciona una fecha y elige al menos un horario disponible",
          variant: "destructive",
        });
        return;
      }

      // Mostrar toast de carga
      const loadingToast = toast({
        title: "Enviando solicitud...",
        description: "Por favor espera mientras procesamos tu solicitud",
        duration: 3000,
      });

      // Preparar datos de la solicitud con múltiples horarios
      const requestData = {
        motivo: appointmentRequest.motivo,
        preferenciaDia: appointmentRequest.fechaSeleccionada,
        preferenciaHora: selectedSlots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', '),
        notas: appointmentRequest.notas,
        fechaSeleccionada: appointmentRequest.fechaSeleccionada,
        horarioSeleccionado: selectedSlots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', '),
        horariosSeleccionados: selectedSlots // Array completo de horarios seleccionados
      };

      // Enviar solicitud usando el servicio
      const response = await appointmentService.requestAppointment(requestData);
      
      // Cerrar formulario
      setShowAppointmentForm(false);
      
      // Limpiar formulario
      setAppointmentRequest({
        motivo: "",
        preferenciaDia: "",
        preferenciaHora: "",
        notas: "",
        fechaSeleccionada: "",
        horarioSeleccionado: ""
      });
      setSelectedDate("");
      setAvailableSlots([]);
      setSelectedSlots([]);
      setExistingAppointments([]);

      // Mostrar mensaje de éxito
      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: response.message || `Solicitud enviada con ${selectedSlots.length} horario(s) seleccionado(s). Nos pondremos en contacto contigo pronto para confirmar tu cita.`,
        duration: 5000,
      });

    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      
      // Mostrar mensaje de error
      toast({
        title: "Error al enviar solicitud",
        description: error.error || error.message || "Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo o contacta por WhatsApp.",
        variant: "destructive",
        duration: 8000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openWhatsApp = () => {
    const message = `Hola, soy ${
      user?.name || "un paciente"
    }. Me gustaría solicitar una cita.`;
    const whatsappUrl = `https://wa.me/5493537304294?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Gonzalo Cajeao Quiropraxia
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Bienvenido, {user?.username}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Mi Panel de Paciente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Paciente */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mi Información</CardTitle>
              <Button size="sm" onClick={() => setEditOpen(true)}>
                Editar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700">Nombre:</p>
                  <p className="text-gray-600">
                    {patientData?.firstName || userData?.name || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Apellido:</p>
                  <p className="text-gray-600">
                    {patientData?.lastName || userData?.lastName || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">DNI:</p>
                  <p className="text-gray-600">
                    {patientData?.dni || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Fecha de Nacimiento:</p>
                  <p className="text-gray-600">
                    {patientData?.birthDate
                      ? new Date(patientData.birthDate).toLocaleDateString("es-AR")
                      : "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Dirección:</p>
                  <p className="text-gray-600">
                    {patientData?.address || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Género:</p>
                  <p className="text-gray-600">
                    {patientData?.gender || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Teléfono:</p>
                  <p className="text-gray-600">
                    {patientData?.phone || userData?.phone || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Email:</p>
                  <p className="text-gray-600">
                    {patientData?.email || userData?.email || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Contacto de Emergencia:</p>
                  <p className="text-gray-600">
                    {patientData?.emergencyContact || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Teléfono de Emergencia:</p>
                  <p className="text-gray-600">
                    {patientData?.emergencyPhone || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Próxima Consulta:</p>
                  <p className="text-gray-600">
                    {nextAppointment
                      ? new Date(
                          `${nextAppointment.date}T${nextAppointment.startTime}`
                        ).toLocaleString("es-AR", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "No disponible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modal de edición */}
          <PatientEdit
            open={editOpen}
            onOpenChange={setEditOpen}
            patientId={patientData?.id}
            onSuccess={loadUserData}
          />

          {/* Solicitar Cita */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Solicitar Nueva Cita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Puedes solicitar una cita a través de WhatsApp o completando
                  el formulario. Nos pondremos en contacto contigo para
                  confirmar la fecha y hora.
                </p>

                <div className="flex space-x-4">
                  <Button
                    onClick={openWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Solicitar por WhatsApp
                  </Button>
                  <Button
                    onClick={() => setShowAppointmentForm(true)}
                    className="flex-1"
                  >
                    Usar Formulario
                  </Button>
                </div>

                {showAppointmentForm && (
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de la Consulta
                      </label>
                      <textarea
                        name="motivo"
                        value={appointmentRequest.motivo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Preferida
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={getTodayString()}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Horarios Disponibles
                          </label>
                          <div className="text-sm text-gray-500">
                            {selectedSlots.length}/3 seleccionados
                          </div>
                        </div>
                        
                        {/* Leyenda de colores */}
                        <div className="mb-3 flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Seleccionado</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-400 rounded"></div>
                            <span>Ya tienes cita activa</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                            <span>Disponible</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                            <span>Ocupado</span>
                          </div>
                        </div>
                        
                        {loadingSlots ? (
                          <div className="flex items-center justify-center p-4 text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                            Cargando horarios...
                          </div>
                        ) : (
                          <div>
                            {/* Mostrar todos los horarios del día */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {getAllTimeSlots().map((slot, index) => {
                                const isOccupiedByPatient = isSlotOccupiedByPatient(slot);
                                const isRescheduledByPatient = isSlotRescheduledByPatient(slot);
                                const isAvailable = slot.available;
                                const isSelected = selectedSlots.some(s => 
                                  `${s.startTime}-${s.endTime}` === `${slot.startTime}-${slot.endTime}`
                                );
                                
                                // Determinar el color y estado del slot
                                let slotColor = '';
                                let isDisabled = false;
                                let tooltip = '';
                                
                                if (isOccupiedByPatient && !isRescheduledByPatient) {
                                  slotColor = 'bg-gray-400 text-white border-gray-400 cursor-not-allowed';
                                  isDisabled = true;
                                  tooltip = 'Ya tienes una cita activa en este horario';
                                } else if (isRescheduledByPatient) {
                                  slotColor = 'bg-red-200 text-red-700 border-red-300 cursor-not-allowed';
                                  isDisabled = true;
                                  tooltip = 'Esta cita fue reagendada por ti';
                                } else if (isSelected) {
                                  slotColor = 'bg-blue-500 text-white border-blue-500';
                                  tooltip = 'Horario seleccionado';
                                } else if (isAvailable) {
                                  slotColor = 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300';
                                  tooltip = 'Horario disponible';
                                } else {
                                  // Solo marcar como ocupado si realmente no está disponible
                                  // El backend ya nos dice cuáles están disponibles, así que los que no están
                                  // en availableSlots están ocupados por otros pacientes
                                  slotColor = 'bg-red-200 text-red-700 border-red-300 cursor-not-allowed';
                                  isDisabled = true;
                                  tooltip = 'Horario ocupado por otro paciente';
                                }
                                
                                return (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => !isDisabled && handleSlotSelection(slot)}
                                    disabled={isDisabled}
                                    title={tooltip}
                                    className={`p-2 text-sm border rounded-md transition-colors ${slotColor}`}
                                  >
                                    {slot.startTime} - {slot.endTime}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Información adicional */}
                            <div className="mt-3 text-xs text-gray-500">
                              <p>• Horarios en <span className="text-gray-400 font-medium">gris</span>: Ya tienes una cita activa</p>
                              <p>• Horarios en <span className="text-red-600 font-medium">rojo</span>: Ocupados por otros pacientes o citas reagendadas</p>
                              <p>• Horarios en <span className="text-blue-600 font-medium">azul</span>: Seleccionados por ti</p>
                              <p>• Horarios en <span className="text-gray-600 font-medium">blanco</span>: Disponibles para seleccionar</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedSlots.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-green-700 text-sm font-medium mb-1">
                              ✓ Horarios seleccionados:
                            </p>
                            <div className="space-y-1">
                              {selectedSlots.map((slot, index) => (
                                <p key={index} className="text-green-600 text-xs">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Adicionales
                      </label>
                      <textarea
                        name="notas"
                        value={appointmentRequest.notas}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Información adicional sobre tu consulta..."
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Importante:</strong> Esta es una solicitud de cita. 
                        El centro quiropráctico se pondrá en contacto contigo para 
                        confirmar la disponibilidad del horario seleccionado.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={!appointmentRequest.motivo.trim() || !selectedDate || selectedSlots.length === 0}
                      >
                        Enviar Solicitud ({selectedSlots.length} horario{selectedSlots.length !== 1 ? 's' : ''})
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAppointmentForm(false);
                          setSelectedDate("");
                          setAvailableSlots([]);
                          setSelectedSlots([]);
                          setExistingAppointments([]);
                          setAppointmentRequest({
                            motivo: "",
                            preferenciaDia: "",
                            preferenciaHora: "",
                            notas: "",
                            fechaSeleccionada: "",
                            horarioSeleccionado: ""
                          });
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
