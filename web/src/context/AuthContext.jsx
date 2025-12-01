import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Función para refrescar el token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshTokenValue
      });

      if (response.data.success) {
        const { token, refresh_token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refresh_token);
        return { success: true, token };
      }
      throw new Error('Error al refrescar token');
    } catch (error) {
      // Si falla el refresh, limpiar todo y hacer logout
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      return { success: false, error };
    }
  };

  const login = async (correo, password) => {
    try {
      const response = await axios.post('/auth/login', { correo, password });
      
      if (response.data.success) {
        const { token, refresh_token, usuario } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(usuario));
        setUser(usuario);
        return { success: true, user: usuario };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAdmin = () => {
    return user?.rol === 'ADMIN';
  };

  const updateUser = (updatedUserData) => {
    // Actualizar el estado local
    setUser(updatedUserData);
    // Actualizar el localStorage
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

