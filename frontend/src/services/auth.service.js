import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Token guardado:', response.data.token);
    } else {
      console.error('No se recibió token en la respuesta');
    }
    return response.data.user;
  } catch (error) {
    console.error('Error en login:', error);
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al registrar usuario' };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Sesión cerrada');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No hay token disponible');
  }
  return token;
};

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al solicitar recuperación de contraseña' };
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al restablecer la contraseña' };
  }
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  forgotPassword,
  resetPassword
}; 