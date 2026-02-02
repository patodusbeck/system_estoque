import React from 'react';
import { Table, Tag, Button, Space, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ProductTable = ({ products, loading, pagination, onEdit, onDelete, onChange }) => {
  const getStatusTag = (status) => {
    const statusConfig = {
      valid: { color: 'success', text: '✅ Válido' },
      near_expiry: { color: 'warning', text: '⚠️ Próximo ao vencimento' },
      expired: { color: 'error', text: '❌ Vencido' }
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      width: 200
    },
    {
      title: 'Lote',
      dataIndex: 'batch',
      key: 'batch',
      width: 120
    },
    {
      title: 'Fornecedor',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => `${quantity} ${record.unit}`
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 120
    },
    {
      title: 'Validade',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Ações',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Tem certeza que deseja excluir este produto?"
            onConfirm={() => onDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Excluir">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      loading={loading}
      rowKey="_id"
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} produtos`
      }}
      onChange={onChange}
      scroll={{ x: 1200 }}
    />
  );
};

export default ProductTable;
