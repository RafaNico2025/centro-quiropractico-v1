import api from './api'

export const userService = {
  // Obtener todos los pacientes
  getPatients: async () => {
    try {
      const response = await api.get('/patients')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener todos los profesionales
  getProfessionals: async () => {
    try {
      const response = await api.get('/users/professionals')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
} 