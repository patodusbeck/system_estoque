import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values.email, values.password);
  };

  return (
    <Card title="Login" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Por favor, insira seu email!' },
            { type: 'email', message: 'Email inválido!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Por favor, insira sua senha!' },
            { min: 6, message: 'Senha deve ter no mínimo 6 caracteres!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Senha"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm;
