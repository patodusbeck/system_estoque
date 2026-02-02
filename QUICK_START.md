# 🍦 Vita Sorvetes - Sistema de Gestão de Estoque

Sistema completo de controle de estoque com foco em gestão de validade de produtos, desenvolvido com React, Node.js, MongoDB e integração com IA para reconhecimento de imagens.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js v18 ou superior
- MongoDB Atlas (conta gratuita em https://www.mongodb.com/cloud/atlas)
- npm ou yarn

### 1. Configurar MongoDB Atlas

1. Crie uma conta gratuita em https://www.mongodb.com/cloud/atlas
2. Crie um novo cluster (tier gratuito M0)
3. Configure o acesso de rede (adicione seu IP ou permita acesso de qualquer lugar para desenvolvimento)
4. Crie um usuário de banco de dados
5. Copie a connection string

### 2. Configurar Backend

```bash
cd backend
npm install
```

Edite o arquivo `backend/.env` e configure:

- `MONGODB_URI`: Cole sua connection string do MongoDB Atlas
- `JWT_SECRET`: Mude para uma chave secreta forte
- `JWT_REFRESH_SECRET`: Mude para outra chave secreta forte

```bash
npm run dev
```

O backend estará rodando em http://localhost:5000

### 3. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em http://localhost:5173

### 4. Acessar o Sistema

1. Abra http://localhost:5173
2. Clique em "Registre-se" para criar uma conta
3. Faça login e comece a usar!

## 📋 Funcionalidades

- ✅ **Autenticação segura** com JWT
- 📦 **CRUD completo de produtos**
- 📅 **Controle automático de status de validade**
- 🔍 **Filtros por status** (válido, próximo ao vencimento, vencido)
- 🔎 **Busca** por descrição, lote e fornecedor
- 🤖 **IA para reconhecimento de produtos** via foto/câmera (Tesseract.js + Open Food Facts)
- 📊 **Dashboard** com estatísticas e gráficos
- 📱 **Interface responsiva** com Ant Design

## 🛠️ Stack Tecnológica

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Tesseract.js (OCR)
- Multer (Upload de imagens)
- Node-cron (Tarefas agendadas)

### Frontend

- React 18 + Vite
- Ant Design
- React Router
- Axios
- Recharts (Gráficos)
- react-webcam (Câmera)

## 📚 Documentação Completa

Veja o [README.md](./README.md) completo para mais detalhes sobre:

- Arquitetura do sistema
- Estrutura de pastas
- API endpoints
- Deploy
- Contribuição

## ⚠️ Notas Importantes

> **MongoDB Atlas**: Configure corretamente a connection string no arquivo `.env` do backend

> **Segurança**: Nunca commite arquivos `.env` com credenciais reais

> **IA**: O sistema usa Tesseract.js (gratuito) para OCR. A Google Vision API é opcional

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

---

Desenvolvido com ❤️ para ajudar pequenos comércios a gerenciar seus estoques de forma eficiente.
