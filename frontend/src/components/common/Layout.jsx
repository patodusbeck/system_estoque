import React from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  InboxOutlined,
  UserOutlined,
  LogoutOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Content, Sider } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/products',
      icon: <InboxOutlined />,
      label: 'Produtos',
      onClick: () => navigate('/products')
    },
    {
      key: '/add-product',
      icon: <CameraOutlined />,
      label: 'Adicionar via IA',
      onClick: () => navigate('/add-product')
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#001529'
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          🍦 Vita Sorvetes
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      
      <AntLayout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0 }}>Sistema de Gestão de Estoque</h2>
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{
            padding: 24,
            minHeight: 360,
            background: '#fff',
            borderRadius: '8px'
          }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
