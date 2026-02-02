import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: '48px', margin: 0 }}>🍦</h1>
        <h2 style={{ color: 'white', margin: '8px 0' }}>Vita Sorvetes</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Sistema de Gestão de Estoque</p>
      </div>

      <LoginForm onSubmit={handleLogin} loading={loading} />

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <span style={{ color: 'white' }}>Não tem uma conta? </span>
        <Button type="link" onClick={() => navigate('/register')} style={{ color: 'white', fontWeight: 'bold' }}>
          Registre-se
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
