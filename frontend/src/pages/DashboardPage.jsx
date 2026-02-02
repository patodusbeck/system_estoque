import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/stats');
      setStats(response.data.data.stats);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const chartData = [
    { name: 'Válidos', value: stats.valid, color: '#52c41a' },
    { name: 'Próximos ao Vencimento', value: stats.nearExpiry, color: '#faad14' },
    { name: 'Vencidos', value: stats.expired, color: '#ff4d4f' }
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Visão geral do estoque
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Produtos"
              value={stats.total}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Produtos Válidos"
              value={stats.valid}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Próximos ao Vencimento"
              value={stats.nearExpiry}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Produtos Vencidos"
              value={stats.expired}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Distribuição por Status">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                Nenhum produto cadastrado
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Produtos por Categoria">
            {Object.keys(stats.byCategory).length > 0 ? (
              <div>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span>{category}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                Nenhuma categoria cadastrada
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {stats.recentlyAdded && stats.recentlyAdded.length > 0 && (
        <Card title="Produtos Adicionados Recentemente" style={{ marginTop: '24px' }}>
          {stats.recentlyAdded.map((product) => (
            <div key={product.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span>{product.description}</span>
              <span style={{
                color: product.status === 'valid' ? '#52c41a' :
                       product.status === 'near_expiry' ? '#faad14' : '#ff4d4f'
              }}>
                {product.status === 'valid' ? '✅ Válido' :
                 product.status === 'near_expiry' ? '⚠️ Próximo ao vencimento' : '❌ Vencido'}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
