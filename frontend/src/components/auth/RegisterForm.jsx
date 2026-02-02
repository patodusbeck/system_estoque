import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const RegisterForm = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values.name, values.email, values.password);
  };

  return (
    <Card title="Criar Conta" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Por favor, insira seu nome!' },
            { min: 3, message: 'Nome deve ter no mínimo 3 caracteres!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nome completo"
            autoComplete="name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Por favor, insira seu email!' },
            { type: 'email', message: 'Email inválido!' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
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
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Por favor, confirme sua senha!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('As senhas não coincidem!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirmar senha"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Registrar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm;
