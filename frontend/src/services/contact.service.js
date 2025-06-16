import api from './api';

export const contactService = {
  // Enviar mensaje de contacto
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/contact', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 