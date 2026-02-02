# 🍦 Sistema de Gestão de Estoque - Vita Sorvetes

Sistema completo de controle de estoque com foco em gestão de validade de produtos, desenvolvido com React, Node.js, MongoDB e integração com IA para reconhecimento de imagens.

## 📋 Sobre o Projeto

Sistema de estoque e gestão de produtos desenvolvido para auxiliar pequenos comércios no controle de datas de validade. O usuário pode cadastrar produtos, editar, excluir e acompanhar de forma prática os itens que estão:

- ✅ **Dentro da validade**
- ⚠️ **Próximos do vencimento**
- ❌ **Já vencidos**

### Funcionalidades Principais

- 🔐 Sistema de autenticação seguro com JWT
- 📦 CRUD completo de produtos
- 📅 Controle automático de status de validade
- 🔍 Filtros por status de validade
- 🔎 Busca por descrição, lote e fornecedor
- 📄 Paginação e feedback visual com Ant Design
- 🤖 **IA para reconhecimento de produtos via foto/câmera**
- 📊 Dashboard com estatísticas e gráficos
- 💾 Integração com MongoDB Atlas

---

## 🛠️ Stack Tecnológica

### Backend

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Banco de Dados**: MongoDB Atlas
- **ODM**: Mongoose
- **Autenticação**: JWT (jsonwebtoken) + bcrypt
- **Validação**: express-validator
- **Upload**: Multer
- **IA/OCR**: Tesseract.js + Google Vision API
- **Agendamento**: node-cron

### Frontend

- **Framework**: React 18+ com Vite
- **UI Library**: Ant Design 5.x
- **Roteamento**: React Router v6
- **Estado Global**: Context API + React Query
- **HTTP Client**: Axios
- **Câmera**: react-webcam
- **Gráficos**: Recharts

### Segurança

- JWT com refresh tokens
- Bcrypt para hash de senhas
- CORS configurado
- Rate limiting
- Helmet para proteção de headers
- Sanitização de inputs

---

## 📐 Arquitetura do Sistema

```mermaid
graph TB
    subgraph Frontend
        A[React App] --> B[Auth Context]
        A --> C[Product Pages]
        A --> D[Camera/Upload]
        B --> E[Axios Instance]
        C --> E
        D --> E
    end

    subgraph Backend
        E --> F[Express API]
        F --> G[Auth Middleware]
        G --> H[Routes]
        H --> I[Controllers]
        I --> J[Services]
        J --> K[Models]
        K --> L[(MongoDB Atlas)]
        J --> M[AI Service]
        M --> N[Tesseract.js]
        M --> O[Google Vision API]
    end

    subgraph External
        M --> P[Open Food Facts API]
    end

    Q[Cron Jobs] --> J
```

---

## 📁 Estrutura de Pastas

### Backend

```
backend/
├── src/
│   ├── config/          # Configurações (DB, JWT, Multer)
│   ├── controllers/     # Controladores das rotas
│   ├── middleware/      # Middlewares (auth, validação, erros)
│   ├── models/          # Schemas do Mongoose
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio e IA
│   ├── utils/           # Funções auxiliares
│   └── server.js        # Servidor principal
├── uploads/             # Imagens enviadas
├── .env                 # Variáveis de ambiente
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── assets/          # Imagens e recursos estáticos
│   ├── components/      # Componentes React
│   │   ├── common/      # Componentes compartilhados
│   │   ├── auth/        # Componentes de autenticação
│   │   ├── products/    # Componentes de produtos
│   │   └── camera/      # Componentes de câmera
│   ├── contexts/        # Context API
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API
│   ├── utils/           # Funções auxiliares
│   ├── App.jsx          # Componente raiz
│   └── main.jsx         # Entry point
└── package.json
```

---

## 🗄️ Modelos de Dados

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema

```javascript
{
  description: String,
  barcode: String (unique),
  batch: String,
  supplier: String,
  quantity: Number,
  unit: String (enum: ['un', 'kg', 'l']),
  manufacturingDate: Date,
  expirationDate: Date,
  status: String (computed: 'valid', 'near_expiry', 'expired'),
  category: String,
  imageUrl: String,
  userId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js v18 ou superior
- MongoDB Atlas (conta gratuita)
- Google Cloud Platform (para Vision API - opcional)

### Backend

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/vita-sorvetes.git
cd vita-sorvetes/backend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do backend:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/vita-sorvetes

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_REFRESH_SECRET=sua_chave_refresh_secreta
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Google Vision API (opcional)
GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json

# CORS
FRONTEND_URL=http://localhost:5173
```

4. **Inicie o servidor**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### Frontend

1. **Navegue até a pasta frontend**

```bash
cd ../frontend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

4. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 📱 Funcionalidades Detalhadas

### 🔐 Autenticação

- Registro de novos usuários
- Login com email e senha
- Tokens JWT com refresh automático
- Proteção de rotas privadas
- Logout seguro

### 📦 Gestão de Produtos

- **Cadastro Manual**: Formulário completo com validação
- **Cadastro via IA**: Upload de foto ou captura via câmera
  - Reconhecimento de código de barras
  - Extração de data de validade
  - Identificação de produto via Open Food Facts
- **Edição**: Atualização de qualquer campo
- **Exclusão**: Com confirmação
- **Listagem**: Tabela paginada com indicadores visuais

### 🔍 Filtros e Busca

- Filtro por status (válido, próximo ao vencimento, vencido)
- Busca por descrição do produto
- Busca por número de lote
- Busca por fornecedor
- Filtros combinados
- Ordenação por colunas

### 📊 Dashboard

- Total de produtos cadastrados
- Produtos vencidos
- Produtos próximos ao vencimento
- Gráficos de distribuição por status
- Estatísticas em tempo real

### 🤖 Reconhecimento de Imagens

- **Tesseract.js**: OCR local para código de barras e texto
- **Google Vision API**: Reconhecimento avançado de texto
- Preview da imagem antes do processamento
- Edição dos dados reconhecidos antes de salvar
- Suporte para câmera e upload

---

## 🧪 Testes

### Backend

```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

### Frontend

```bash
# Testes de componentes
npm test

# Testes E2E (opcional)
npm run cypress:open
```

---

## 📦 Deploy

### Backend (Railway/Render)

1. Configure as variáveis de ambiente na plataforma
2. Conecte o repositório
3. Deploy automático a cada push

### Frontend (Vercel/Netlify)

1. Configure a variável `VITE_API_URL` com a URL do backend
2. Conecte o repositório
3. Deploy automático a cada push

---

## 🗓️ Roadmap

### Fase 1: MVP ✅

- [x] Autenticação
- [x] CRUD de produtos
- [x] Filtros e busca
- [x] Dashboard básico

### Fase 2: IA 🚧

- [ ] Integração com Tesseract.js
- [ ] Integração com Google Vision API
- [ ] Reconhecimento de código de barras
- [ ] Extração de data de validade

### Fase 3: Melhorias 📋

- [ ] Notificações push
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Modo escuro
- [ ] PWA
- [ ] Internacionalização

### Fase 4: Avançado 🔮

- [ ] App mobile (React Native)
- [ ] Integração com fornecedores
- [ ] Sistema de pedidos automáticos
- [ ] Analytics avançado

---

## 📚 Documentação da API

### Autenticação

#### POST `/api/auth/register`

Registra um novo usuário.

**Body:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST `/api/auth/login`

Realiza login e retorna tokens.

**Body:**

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

### Produtos

#### GET `/api/products`

Lista produtos com filtros e paginação.

**Query Params:**

- `page`: número da página (default: 1)
- `limit`: itens por página (default: 10)
- `status`: valid | near_expiry | expired
- `search`: busca por descrição/lote/fornecedor

#### POST `/api/products`

Cria um novo produto.

**Body:**

```json
{
  "description": "Sorvete de Chocolate",
  "barcode": "7891234567890",
  "batch": "L001",
  "supplier": "Fornecedor ABC",
  "quantity": 50,
  "unit": "un",
  "manufacturingDate": "2024-01-01",
  "expirationDate": "2024-06-01",
  "category": "Sorvetes"
}
```

#### PUT `/api/products/:id`

Atualiza um produto existente.

#### DELETE `/api/products/:id`

Exclui um produto.

### Imagens

#### POST `/api/images/analyze`

Analisa uma imagem e extrai informações do produto.

**Body (multipart/form-data):**

- `image`: arquivo de imagem

**Response:**

```json
{
  "barcode": "7891234567890",
  "description": "Sorvete de Chocolate",
  "expirationDate": "2024-06-01",
  "confidence": 0.95
}
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## ⚠️ Observações Importantes

> [!IMPORTANT]
> **Google Vision API** requer configuração de billing no Google Cloud Platform. Existe um tier gratuito de 1000 requisições/mês.

> [!WARNING]
> **Segurança**: Nunca commitar arquivos `.env` com credenciais. Use `.env.example` como template.

> [!NOTE]
> **MongoDB Atlas**: O tier gratuito (M0) oferece 512MB de armazenamento, suficiente para começar.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar pequenos comércios a gerenciar seus estoques de forma eficiente.

---

## 📞 Suporte

Para dúvidas ou sugestões, abra uma [issue](https://github.com/seu-usuario/vita-sorvetes/issues) no GitHub.
