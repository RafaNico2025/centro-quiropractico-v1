import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  } catch (error) {
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
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated
}; 