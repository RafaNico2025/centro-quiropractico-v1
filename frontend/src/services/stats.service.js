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
  },

  // Exportar estadísticas a Excel
  exportToExcel: async (filters = {}) => {
    try {
      const response = await api.get('/stats/export', { 
        params: filters,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      // Verificar que la respuesta sea un Blob
      if (!(response.data instanceof Blob)) {
        throw new Error('La respuesta no es un archivo válido');
      }

      // Crear el nombre del archivo
      const fileName = `estadisticas_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Crear un objeto URL para el archivo
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Agregar al documento y hacer clic
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error al exportar:', error);
      if (error.response?.data instanceof Blob) {
        // Si el error viene como Blob, leerlo como texto
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw errorData;
        } catch (e) {
          throw new Error(text);
        }
      }
      throw error.response?.data || error.message;
    }
  }
}; 