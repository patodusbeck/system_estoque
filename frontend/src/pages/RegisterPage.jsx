import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    const result = await register(name, email, password);
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
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Crie sua conta</p>
      </div>

      <RegisterForm onSubmit={handleRegister} loading={loading} />

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <span style={{ color: 'white' }}>Já tem uma conta? </span>
        <Button type="link" onClick={() => navigate('/login')} style={{ color: 'white', fontWeight: 'bold' }}>
          Faça login
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
