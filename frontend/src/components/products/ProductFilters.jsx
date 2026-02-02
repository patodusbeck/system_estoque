import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const ProductFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
      <Space wrap>
        <Search
          placeholder="Buscar por descrição, lote ou fornecedor"
          allowClear
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          onSearch={(value) => onFilterChange('search', value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />

        <Select
          placeholder="Filtrar por status"
          allowClear
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          style={{ width: 200 }}
        >
          <Option value="valid">✅ Válidos</Option>
          <Option value="near_expiry">⚠️ Próximos ao vencimento</Option>
          <Option value="expired">❌ Vencidos</Option>
        </Select>

        <Button
          icon={<ClearOutlined />}
          onClick={onClear}
        >
          Limpar Filtros
        </Button>
      </Space>
    </Space>
  );
};

export default ProductFilters;
