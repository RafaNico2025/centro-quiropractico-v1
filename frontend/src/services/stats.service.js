import api from './api';

export const statsService = {
  // Obtener estadísticas generales
  getGeneral: async (filters = {}) => {
    try {
      const response = await api.get('/stats/general', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas de citas
  getAppointments: async (filters = {}) => {
    try {
      const response = await api.get('/stats/appointments', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas de pacientes
  getPatients: async () => {
    try {
      const response = await api.get('/stats/patients');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 