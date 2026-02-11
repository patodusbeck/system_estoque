# Deploy para Vercel - Passo a Passo

## 📋 Checklist Pré-Deploy

Antes de fazer o deploy, certifique-se de que:

- [x] Todos os arquivos foram criados
- [x] npm install foi executado com sucesso
- [x] .gitignore está configurado (protege .env.local)
- [ ] Código foi commitado no Git
- [ ] Variáveis de ambiente serão configuradas na Vercel

## 🚀 Comandos para Deploy

### 1. Adicionar arquivos ao Git

```bash
git add .
```

### 2. Fazer commit

```bash
git commit -m "feat: implementar sistema de carrinho com MongoDB e WhatsApp"
```

### 3. Push para repositório (se tiver)

```bash
git push
```

### 4. Deploy na Vercel

```bash
vercel --prod
```

## ⚙️ Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Após o deploy, você DEVE configurar as variáveis de ambiente:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `gaaksuplementos`
3. Vá em **Settings → Environment Variables**
4. Adicione:
   - **Nome:** `MONGODB_URI`
   - **Valor:** `mongodb+srv://gaak_suplements:gaakpass@gaak.igh80e9.mongodb.net/?appName=gaak`
   - **Environments:** Production, Preview, Development

5. Adicione:
   - **Nome:** `WHATSAPP_PHONE`
   - **Valor:** `5599984065730`
   - **Environments:** Production, Preview, Development

6. Clique em **Save**

7. **Redeploy** o projeto para aplicar as variáveis:
   - Vá em **Deployments**
   - Clique nos 3 pontos do último deployment
   - Clique em **Redeploy**

## ✅ Verificar Deploy

Após o deploy, teste:

1. Acesse: https://gaaksuplementos.vercel.app/produtos.html
2. Clique em "VER DETALHES" em um produto
3. Adicione ao carrinho
4. Finalize uma compra de teste
5. Verifique se o pedido foi salvo no MongoDB

---

**Status Atual:** Pronto para deploy! Execute os comandos acima.
