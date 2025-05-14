import api from './api';

export const medicalHistoryService = {
  // Obtener historial médico por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/medical-history/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener historial médico de un paciente
  getByPatientId: async (patientId) => {
    try {
      const response = await api.get(`/medical-history/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo registro de historial médico
  create: async (historyData) => {
    try {
      const response = await api.post('/medical-history', historyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar registro de historial médico
  update: async (id, historyData) => {
    try {
      const response = await api.put(`/medical-history/${id}`, historyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar registro de historial médico
  delete: async (id) => {
    try {
      const response = await api.delete(`/medical-history/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 