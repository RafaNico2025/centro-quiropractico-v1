import api from './api'

export const userService = {
  // Obtener todos los pacientes
  getPatients: async (search = "") => {
    try {
      const response = await api.get('/users/patients', {
        params: search ? { search } : {}
      })
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

  // Obtener lista de profesionales
  getProfessionals: async () => {
    try {
      const response = await api.get('/users/professionals');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error al obtener profesionales';
      throw new Error(errorMessage);
    }
  }
} 