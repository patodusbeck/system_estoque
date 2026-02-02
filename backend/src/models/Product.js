import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [3, 'Descrição deve ter no mínimo 3 caracteres']
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true, // Permite múltiplos documentos sem barcode
    index: true
  },
  batch: {
    type: String,
    required: [true, 'Lote é obrigatório'],
    trim: true
  },
  supplier: {
    type: String,
    required: [true, 'Fornecedor é obrigatório'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantidade é obrigatória'],
    min: [0, 'Quantidade não pode ser negativa']
  },
  unit: {
    type: String,
    enum: ['un', 'kg', 'l'],
    default: 'un'
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Data de fabricação é obrigatória']
  },
  expirationDate: {
    type: Date,
    required: [true, 'Data de validade é obrigatória'],
    index: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Geral'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular o status baseado na data de validade
productSchema.virtual('status').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDate = new Date(this.expirationDate);
  expirationDate.setHours(0, 0, 0, 0);
  
  // Calcula diferença em dias
  const diffTime = expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired'; // Vencido
  } else if (diffDays <= 7) {
    return 'near_expiry'; // Próximo ao vencimento (7 dias ou menos)
  } else {
    return 'valid'; // Válido
  }
});

// Virtual para calcular dias até o vencimento
productSchema.virtual('daysUntilExpiration').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDate = new Date(this.expirationDate);
  expirationDate.setHours(0, 0, 0, 0);
  
  const diffTime = expirationDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Índice composto para otimizar queries
productSchema.index({ userId: 1, expirationDate: 1 });
productSchema.index({ userId: 1, description: 'text', batch: 'text', supplier: 'text' });

// Validação customizada: data de validade deve ser posterior à data de fabricação
productSchema.pre('save', function(next) {
  if (this.expirationDate <= this.manufacturingDate) {
    next(new Error('Data de validade deve ser posterior à data de fabricação'));
  } else {
    next();
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
