import mongoose from 'mongoose';

let cachedConnection = null;

export async function connectDB() {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGODB_URI is not configured');
  }

  const conn = await mongoose.connect(mongoUri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedConnection = conn.connection;
  return cachedConnection;
}

const productSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: String,
    slug: String,
    weight: String,
    preco: { type: Number, required: true },
    estoque: { type: Number, default: 0 },
    categoria: { type: String, required: true },
    img: String,
    images: [{ type: String }],
    benefits: [{ type: String }],
    inStock: { type: Boolean, default: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const clientSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    email: String,
    endereco: String,
  },
  { timestamps: true }
);

const saleSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clienteNome: String,
    produtos: [
      {
        produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        nome: String,
        preco: Number,
        quantidade: Number,
      },
    ],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true },
    pagamento: {
      type: String,
      enum: ['pix', 'dinheiro', 'debito', 'credito'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'concluida', 'cancelada'],
      default: 'concluida',
    },
    data: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
export const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
