import React, { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { PlusOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductTable from '../components/products/ProductTable';
import ProductFilters from '../components/products/ProductFilters';
import ProductForm from '../components/products/ProductForm';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: undefined
  });
  const [sortBy, setSortBy] = useState('expirationDate');
  const [order, setOrder] = useState('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit, filters, sortBy, order]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order,
        ...filters
      };

      const response = await api.get('/products', { params });
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      message.error('Erro ao carregar produtos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }));

    if (sorter.field) {
      setSortBy(sorter.field);
      setOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: undefined });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (error) {
      message.error('Erro ao excluir produto');
      console.error(error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setFormLoading(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, values);
        message.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', values);
        message.success('Produto criado com sucesso!');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      message.error('Erro ao salvar produto');
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1>Produtos</h1>
          <p style={{ color: '#666', margin: 0 }}>
            Gerencie seu estoque de produtos
          </p>
        </div>
        <Space>
          <Button
            type="default"
            icon={<CameraOutlined />}
            onClick={() => navigate('/add-product')}
          >
            Adicionar via IA
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Novo Produto
          </Button>
        </Space>
      </div>

      <ProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <ProductTable
        products={products}
        loading={loading}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChange={handleTableChange}
      />

      <ProductForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingProduct}
        loading={formLoading}
      />
    </div>
  );
};

export default ProductsPage;
