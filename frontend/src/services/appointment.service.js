import api from './api';

export const appointmentService = {
  // Obtener todas las citas
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener una cita por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear una nueva cita
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
      throw error.response?.data || error.message;
    }
  },

  // Eliminar una cita
  delete: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enviar recordatorio manual
  sendReminder: async (id) => {
    try {
      const response = await api.post(`/appointments/${id}/send-reminder`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Solicitar cita desde dashboard del paciente
  requestAppointment: async (appointmentRequestData) => {
    try {
      const response = await api.post('/appointments/request', appointmentRequestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 