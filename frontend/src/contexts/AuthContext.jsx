import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data.data;

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      message.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Função de registro
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token, refreshToken } = response.data.data;

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(user);
      message.success('Registro realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    message.info('Logout realizado com sucesso!');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
