import mongoose from 'mongoose';
import { connectDB, Client, Product, Sale, Coupon } from './_shared/db.js';

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function mapPaymentMethod(method) {
  const normalized = String(method || '').toLowerCase();
  if (normalized === 'pix') return 'pix';
  if (normalized === 'dinheiro') return 'dinheiro';
  if (normalized === 'cartão' || normalized === 'cartao') return 'credito';
  if (normalized === 'credito' || normalized === 'debito') return normalized;
  return 'pix';
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeCouponCode(value) {
  return String(value || '').trim().toUpperCase();
}

function getCouponStatus(coupon) {
  const now = new Date();
  if (!coupon.active) return 'inativo';
  if (coupon.startsAt && now < coupon.startsAt) return 'agendado';
  if (coupon.expiresAt && now > coupon.expiresAt) return 'expirado';
  return 'ativo';
}

async function findClientForOrder(customer) {
  const nome = String(customer?.name || '').trim();
  const phoneRaw = String(customer?.phone || '').trim();
  const phoneDigits = normalizePhone(phoneRaw);

  if (phoneDigits) {
    const candidates = await Client.find({ telefone: { $exists: true, $ne: '' } });
    const found = candidates.find((client) => normalizePhone(client.telefone) === phoneDigits);
    if (found) return found;
  }

  if (nome) {
    return Client.findOne({ nome });
  }

  return null;
}

async function upsertClient(customer) {
  const nome = String(customer?.name || '').trim();
  const phone = String(customer?.phone || '').trim() || 'Nao informado';
  const address = customer?.address || {};
  const endereco = [
    `${address.street || ''}, ${address.number || ''}`.trim().replace(/^,\s*/, ''),
    address.complement || '',
    address.neighborhood || '',
    `${address.city || ''} - ${address.state || ''}`.trim().replace(/^-\s*/, ''),
    address.zipCode ? `CEP: ${address.zipCode}` : ''
  ].filter(Boolean).join(' | ');

  const existingClient = await findClientForOrder(customer);
  if (existingClient) {
    existingClient.nome = nome || existingClient.nome;
    existingClient.telefone = phone || existingClient.telefone;
    existingClient.endereco = endereco || existingClient.endereco || '';
    await existingClient.save();
    return existingClient;
  }

  const client = new Client({
    nome,
    telefone: phone,
    endereco
  });
  await client.save();
  return client;
}

async function resolveProductReference(item) {
  const id = String(item?.id || '').trim();
  const name = String(item?.name || '').trim();

  if (id && isValidObjectId(id)) {
    const byId = await Product.findById(id);
    if (byId) return byId;
  }

  if (id) {
    const bySlug = await Product.findOne({ slug: id });
    if (bySlug) return bySlug;
  }

  if (name) {
    const byName = await Product.findOne({ nome: name });
    if (byName) return byName;
  }

  return null;
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo nao permitido' });
  }

  try {
    await connectDB();

    const { customer, products, paymentMethod, couponCode } = req.body || {};

    if (!customer?.name || String(customer.name).trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Cliente invalido' });
    }
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: 'Carrinho vazio' });
    }

    const client = await upsertClient(customer);

    const saleItems = [];
    let subtotal = 0;

    for (const item of products) {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const product = await resolveProductReference(item);

      if (!product || product.ativo === false) {
        return res.status(400).json({
          success: false,
          error: `Produto nao encontrado: ${item?.name || item?.id || 'desconhecido'}`
        });
      }

      if (Number(product.estoque || 0) < quantity) {
        return res.status(400).json({
          success: false,
          error: `Estoque insuficiente para ${product.nome}. Disponivel: ${product.estoque}`
        });
      }

      product.estoque = Number(product.estoque || 0) - quantity;
      product.inStock = product.estoque > 0;
      await product.save();

      const unitPrice = Number(product.preco || 0);
      subtotal += unitPrice * quantity;

      saleItems.push({
        produto: product._id,
        nome: product.nome,
        preco: unitPrice,
        quantidade: quantity
      });
    }

    const normalizedCouponCode = normalizeCouponCode(couponCode);
    let discountAmount = 0;
    let appliedCouponCode = '';
    if (normalizedCouponCode) {
      const coupon = await Coupon.findOne({ code: normalizedCouponCode });
      if (!coupon) {
        return res.status(400).json({ success: false, error: 'Cupom nao encontrado' });
      }

      const status = getCouponStatus(coupon);
      if (status !== 'ativo') {
        return res.status(400).json({ success: false, error: `Cupom ${status}` });
      }

      discountAmount = Number(((subtotal * Number(coupon.discountPercent || 0)) / 100).toFixed(2));
      appliedCouponCode = coupon.code;
    }

    const finalTotal = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));

    const sale = new Sale({
      cliente: client._id,
      clienteNome: client.nome,
      produtos: saleItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount,
      couponCode: appliedCouponCode,
      total: finalTotal,
      pagamento: mapPaymentMethod(paymentMethod),
      status: 'concluida'
    });
    await sale.save();

    return res.status(201).json({
      success: true,
      saleId: sale._id,
      clientId: client._id,
      subtotal: sale.subtotal,
      discountAmount: sale.discountAmount,
      total: sale.total,
      couponCode: sale.couponCode || '',
      message: 'Pedido sincronizado com sucesso'
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar pedido',
      message: error.message
    });
  }
};
