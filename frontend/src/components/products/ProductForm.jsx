import React, { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Modal } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const ProductForm = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Edição - preencher formulário
        form.setFieldsValue({
          ...initialValues,
          manufacturingDate: initialValues.manufacturingDate ? dayjs(initialValues.manufacturingDate) : null,
          expirationDate: initialValues.expirationDate ? dayjs(initialValues.expirationDate) : null
        });
      } else {
        // Novo produto - limpar formulário
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        manufacturingDate: values.manufacturingDate.format('YYYY-MM-DD'),
        expirationDate: values.expirationDate.format('YYYY-MM-DD')
      };
      onSubmit(formattedValues);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={initialValues ? 'Editar Produto' : 'Novo Produto'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="Salvar"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="description"
          label="Descrição"
          rules={[
            { required: true, message: 'Descrição é obrigatória' },
            { min: 3, message: 'Descrição deve ter no mínimo 3 caracteres' }
          ]}
        >
          <Input placeholder="Ex: Sorvete de Chocolate" />
        </Form.Item>

        <Form.Item
          name="barcode"
          label="Código de Barras"
        >
          <Input placeholder="Ex: 7891234567890" />
        </Form.Item>

        <Form.Item
          name="batch"
          label="Lote"
          rules={[{ required: true, message: 'Lote é obrigatório' }]}
        >
          <Input placeholder="Ex: L001" />
        </Form.Item>

        <Form.Item
          name="supplier"
          label="Fornecedor"
          rules={[{ required: true, message: 'Fornecedor é obrigatório' }]}
        >
          <Input placeholder="Ex: Fornecedor ABC" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoria"
        >
          <Input placeholder="Ex: Sorvetes" />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantidade"
          rules={[
            { required: true, message: 'Quantidade é obrigatória' },
            { type: 'number', min: 0, message: 'Quantidade não pode ser negativa' }
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Ex: 50" />
        </Form.Item>

        <Form.Item
          name="unit"
          label="Unidade"
          rules={[{ required: true, message: 'Unidade é obrigatória' }]}
        >
          <Select placeholder="Selecione a unidade">
            <Option value="un">Unidade (un)</Option>
            <Option value="kg">Quilograma (kg)</Option>
            <Option value="l">Litro (l)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="manufacturingDate"
          label="Data de Fabricação"
          rules={[{ required: true, message: 'Data de fabricação é obrigatória' }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            placeholder="Selecione a data"
          />
        </Form.Item>

        <Form.Item
          name="expirationDate"
          label="Data de Validade"
          rules={[
            { required: true, message: 'Data de validade é obrigatória' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const manufacturingDate = getFieldValue('manufacturingDate');
                if (!value || !manufacturingDate || value.isAfter(manufacturingDate)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Data de validade deve ser posterior à data de fabricação'));
              },
            }),
          ]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            placeholder="Selecione a data"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
