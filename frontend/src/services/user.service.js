import api from './api'

export const userService = {
  // Obtener todos los pacientes
  getPatients: async () => {
    try {
      const response = await api.get('/patients')
      console.log('Respuesta de pacientes:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener pacientes:', error)
      throw error.response?.data || error.message
    }
  },

  // Obtener todos los profesionales
  getProfessionals: async () => {
    try {
      const response = await api.get('/users/professionals')
      console.log('Respuesta de profesionales:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener profesionales:', error)
      throw error.response?.data || error.message
    }
  }
} 