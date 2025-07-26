import api from './api';

export const appointmentService = {
  // Obtener todas las citas
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    } catch (error) {
      // Mejorar el manejo de errores específicos
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al obtener las citas';
      throw new Error(errorMessage);
    }
  },

  // Obtener una cita por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al obtener la cita';
      throw new Error(errorMessage);
    }
  },

  // Crear una nueva cita
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al crear la cita';
      throw new Error(errorMessage);
    }
  },

  // Actualizar una cita
  update: async (id, appointmentData) => {
    try {
      console.log('Enviando actualización al servidor:', { id, appointmentData });
      const response = await api.put(`/appointments/${id}`, appointmentData);
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en la actualización:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al actualizar la cita';
      throw new Error(errorMessage);
    }
  },

  // Eliminar una cita
  delete: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al eliminar la cita';
      throw new Error(errorMessage);
    }
  },

  // Enviar recordatorio manual
  sendReminder: async (id) => {
    try {
      const response = await api.post(`/appointments/${id}/send-reminder`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al enviar recordatorio';
      throw new Error(errorMessage);
    }
  },

  // Solicitar cita desde dashboard del paciente
  requestAppointment: async (appointmentRequestData) => {
    try {
      const response = await api.post('/appointments/request', appointmentRequestData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al solicitar cita';
      throw new Error(errorMessage);
    }
  },

  // Obtener slots de tiempo disponibles
  getAvailableSlots: async (date, professionalId = null) => {
    try {
      const params = { date };
      if (professionalId) {
        params.professionalId = professionalId;
      }
      
      const response = await api.get('/appointments/available-slots', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al obtener horarios disponibles';
      throw new Error(errorMessage);
    }
  },

  // Obtener solicitudes pendientes
  getPending: async () => {
    try {
      const response = await api.get('/appointments/pending');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al obtener solicitudes pendientes';
      throw new Error(errorMessage);
    }
  },

  // Aprobar una solicitud de cita
  approve: async (id, appointmentData = {}) => {
    try {
      const response = await api.put(`/appointments/${id}/approve`, appointmentData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al aprobar la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Rechazar una solicitud de cita
  reject: async (id, rejectionData) => {
    try {
      const response = await api.put(`/appointments/${id}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al rechazar la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Agendar una cita aprobada
  schedule: async (id) => {
    try {
      const response = await api.put(`/appointments/${id}/schedule`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al agendar la cita';
      throw new Error(errorMessage);
    }
  }
}; 