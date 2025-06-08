import api from './api'

export const userService = {
  // Obtener todos los pacientes
  getPatients: async () => {
    try {
      const response = await api.get('/users/patients')
      console.log('Respuesta de pacientes:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener pacientes:', error)
      throw error.response?.data || error.message
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await api.get(`/users/patients/${id}`)
      console.log('Respuesta de paciente por ID:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener paciente por ID:', error)
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