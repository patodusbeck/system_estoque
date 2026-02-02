import React, { useState, useRef } from 'react';
import { Upload, Button, Card, Spin, Form, Input, InputNumber, DatePicker, Select, message, Space } from 'antd';
import { UploadOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import dayjs from 'dayjs';
import api from '../services/api';

const { Option } = Select;

const AddProductPage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [form] = Form.useForm();
  
  const [mode, setMode] = useState(null); // 'camera' ou 'upload'
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      message.error('Erro ao capturar imagem');
      return;
    }

    // Converter base64 para blob
    const blob = await fetch(imageSrc).then(r => r.blob());
    const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });

    analyzeImage(file, imageSrc);
  };

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      analyzeImage(file, e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevenir upload automático
  };

  const analyzeImage = async (file, preview) => {
    try {
      setAnalyzing(true);
      setImagePreview(preview);

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/images/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data.data.extracted;
      setExtractedData(data);

      // Preencher formulário com dados extraídos
      form.setFieldsValue({
        description: data.description || '',
        barcode: data.barcode || '',
        expirationDate: data.expirationDate ? dayjs(data.expirationDate) : null
      });

      message.success(`Imagem analisada! Confiança: ${Math.round(data.confidence * 100)}%`);
    } catch (error) {
      message.error('Erro ao analisar imagem');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const formattedValues = {
        ...values,
        manufacturingDate: values.manufacturingDate.format('YYYY-MM-DD'),
        expirationDate: values.expirationDate.format('YYYY-MM-DD')
      };

      await api.post('/products', formattedValues);
      message.success('Produto criado com sucesso!');
      navigate('/products');
    } catch (error) {
      message.error('Erro ao salvar produto');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!mode) {
    return (
      <div>
        <h1>Adicionar Produto via IA</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Escolha como deseja adicionar o produto
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Card
            hoverable
            style={{ width: 300, textAlign: 'center' }}
            onClick={() => setMode('camera')}
          >
            <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <h3>Capturar com Câmera</h3>
            <p>Use a câmera para tirar uma foto do produto</p>
          </Card>

          <Card
            hoverable
            style={{ width: 300, textAlign: 'center' }}
            onClick={() => setMode('upload')}
          >
            <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <h3>Fazer Upload</h3>
            <p>Envie uma foto do produto do seu dispositivo</p>
          </Card>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button onClick={() => navigate('/products')}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Adicionar Produto via IA</h1>
      <Button onClick={() => setMode(null)} style={{ marginBottom: '16px' }}>
        ← Voltar
      </Button>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Área de captura/upload */}
        <Card title={mode === 'camera' ? 'Câmera' : 'Upload'} style={{ flex: 1, minWidth: 300 }}>
          {mode === 'camera' && !imagePreview && (
            <div>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <Button
                type="primary"
                icon={<CameraOutlined />}
                onClick={handleCapture}
                loading={analyzing}
                block
                style={{ marginTop: '16px' }}
              >
                Capturar Foto
              </Button>
            </div>
          )}

          {mode === 'upload' && !imagePreview && (
            <Upload
              accept="image/*"
              beforeUpload={handleUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} block size="large">
                Selecionar Imagem
              </Button>
            </Upload>
          )}

          {imagePreview && (
            <div>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
              {analyzing && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Spin />
                  <p>Analisando imagem...</p>
                </div>
              )}
              {!analyzing && (
                <Button
                  onClick={() => {
                    setImagePreview(null);
                    setExtractedData(null);
                    form.resetFields();
                  }}
                  block
                  style={{ marginTop: '16px' }}
                >
                  Tirar Nova Foto
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Formulário */}
        {extractedData && (
          <Card title="Dados do Produto" style={{ flex: 1, minWidth: 300 }}>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Revise e complete os dados extraídos da imagem
            </p>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
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

              <Form.Item name="barcode" label="Código de Barras">
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

              <Form.Item name="category" label="Categoria">
                <Input placeholder="Ex: Sorvetes" />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Quantidade"
                rules={[{ required: true, message: 'Quantidade é obrigatória' }]}
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
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
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
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    Salvar Produto
                  </Button>
                  <Button onClick={() => navigate('/products')}>
                    Cancelar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddProductPage;
