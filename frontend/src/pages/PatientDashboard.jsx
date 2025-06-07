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

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [appointmentRequest, setAppointmentRequest] = useState({
    motivo: "",
    preferenciaDia: "",
    preferenciaHora: "",
    notas: "",
  });

  const storedUser = user || JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Traer datos del usuario por ID
  const loadUserData = async () => {
    try {
      const response = await api.get(`/users/${storedUser.id}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  // 2. Traer pacientes y buscar coincidencia
  const loadPatients = async () => {
    try {
      const data = await userService.getPatients();
      setPatients(data);
      // Comparar name del usuario con firstName del paciente
      if (userData) {
        const match = data.find(
          (p) =>
            p.firstName?.toLowerCase() === userData.Nombre?.toLowerCase() ||
            p.firstName?.toLowerCase() === userData.name?.toLowerCase()
        );
        setPatientMatch(match);
      }
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
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
          (appt) =>
            appt.Patient &&
            appt.Patient.firstName &&
            appt.Patient.firstName.toLowerCase() === userName?.toLowerCase()
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
      if (!appointmentRequest.motivo.trim() || !appointmentRequest.preferenciaDia.trim() || !appointmentRequest.preferenciaHora.trim()) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
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

      // Enviar solicitud usando el servicio
      const response = await appointmentService.requestAppointment(appointmentRequest);
      
      // Cerrar formulario
      setShowAppointmentForm(false);
      
      // Limpiar formulario
      setAppointmentRequest({
        motivo: "",
        preferenciaDia: "",
        preferenciaHora: "",
        notas: "",
      });

      // Mostrar mensaje de éxito
      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: response.message || "Nos pondremos en contacto contigo pronto para confirmar tu cita.",
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
    const whatsappUrl = `https://wa.me/5493516171562?text=${encodeURIComponent(
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
            <CardHeader>
              <CardTitle>Mi Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700">Nombre:</p>
                  <p className="text-gray-600">
                    {userData?.Nombre || userData?.name || "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Email:</p>
                  <p className="text-gray-600">
                    {userData?.Email || userData?.email || "No disponible"}
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
                        Preferencia de Día
                      </label>
                      <input
                        type="text"
                        name="preferenciaDia"
                        value={appointmentRequest.preferenciaDia}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Lunes a Viernes"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferencia de Hora
                      </label>
                      <input
                        type="text"
                        name="preferenciaHora"
                        value={appointmentRequest.preferenciaHora}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Mañana o Tarde"
                        required
                      />
                    </div>

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
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" className="flex-1">
                        Enviar Solicitud
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAppointmentForm(false)}
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
