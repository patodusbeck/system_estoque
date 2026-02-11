import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGODB_URI or MONGO_URI environment variable is not defined');
}

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { customer, products, paymentMethod, total } = req.body;

    // Validation
    const errors = validateOrder({ customer, products, paymentMethod, total });
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos', 
        details: errors 
      });
    }

    // Connect to MongoDB
    const client = await connectToDatabase();
    const db = client.db('gaak_suplementos');
    const orders = db.collection('orders');

    // Create order object
    const order = {
      customer: {
        name: customer.name.trim(),
        address: {
          street: customer.address.street.trim(),
          number: customer.address.number.trim(),
          neighborhood: customer.address.neighborhood.trim(),
          city: customer.address.city.trim(),
          state: customer.address.state.trim(),
          zipCode: customer.address.zipCode.replace(/\D/g, ''),
          complement: customer.address.complement?.trim() || ''
        },
        phone: customer.phone || ''
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.quantity * p.price
      })),
      paymentMethod,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      whatsappSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const result = await orders.insertOne(order);

    // Return success
    return res.status(201).json({
      success: true,
      orderId: result.insertedId.toString(),
      message: 'Pedido salvo com sucesso!'
    });

  } catch (error) {
    console.error('Error saving order:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar pedido',
      message: error.message
    });
  }
}

function validateOrder(data) {
  const errors = [];

  // Customer validation
  if (!data.customer?.name || data.customer.name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  // Address validation
  if (!data.customer?.address?.street || data.customer.address.street.trim().length < 3) {
    errors.push('Rua inválida');
  }

  if (!data.customer?.address?.number) {
    errors.push('Número do endereço é obrigatório');
  }

  if (!data.customer?.address?.neighborhood || data.customer.address.neighborhood.trim().length < 2) {
    errors.push('Bairro inválido');
  }

  if (!data.customer?.address?.city || data.customer.address.city.trim().length < 2) {
    errors.push('Cidade inválida');
  }

  if (!data.customer?.address?.state || data.customer.address.state.trim().length !== 2) {
    errors.push('Estado deve ter 2 letras (ex: MA)');
  }

  const zipCode = data.customer?.address?.zipCode?.replace(/\D/g, '');
  if (!zipCode || zipCode.length !== 8) {
    errors.push('CEP inválido (deve ter 8 dígitos)');
  }

  // Products validation
  if (!Array.isArray(data.products) || data.products.length === 0) {
    errors.push('Carrinho vazio');
  }

  // Payment method validation
  if (!['PIX', 'Cartão', 'Dinheiro'].includes(data.paymentMethod)) {
    errors.push('Forma de pagamento inválida');
  }

  // Total validation
  if (typeof data.total !== 'number' || data.total <= 0) {
    errors.push('Valor total inválido');
  }

  return errors;
}
