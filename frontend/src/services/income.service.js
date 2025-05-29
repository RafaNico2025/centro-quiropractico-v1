import api from './api'

export const incomeService = {
  // Crear un nuevo ingreso
  create: async (incomeData) => {
    try {
      const response = await api.post('/incomes', incomeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener ingreso por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/incomes/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar ingreso
  update: async (id, incomeData) => {
    try {
      const response = await api.put(`/incomes/${id}`, incomeData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Eliminar ingreso
  delete: async (id) => {
    try {
      const response = await api.delete(`/incomes/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener ingresos por rango de fechas
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get(`/incomes/date-range?startDate=${startDate}&endDate=${endDate}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener ingresos por paciente
  getByPatient: async (patientId) => {
    try {
      const response = await api.get(`/incomes/patient/${patientId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener ingresos diarios con paginación
  getDaily: async ({ date, page = 1, limit = 10 }) => {
    try {
      const response = await api.get(`/incomes/daily?date=${date}&page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}





