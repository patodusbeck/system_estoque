import { connectDB, Product } from './_shared/db.js';

function getSeedProducts() {
  return [
    {
      nome: 'Creatina Max Titanium 300g',
      descricao:
        'Creatina monohidratada de alta qualidade. Aumenta forca, melhora desempenho e acelera recuperacao.',
      slug: 'creatina-max-titanium-300g',
      weight: '300g',
      preco: 59.99,
      estoque: 100,
      categoria: 'creatina',
      images: ['images/painelgaak.png'],
      benefits: ['Forca e desempenho', 'Mais energia no treino', 'Recuperacao muscular'],
      inStock: true,
      ativo: true,
    },
    {
      nome: 'Whey Protein Max Titanium 900g',
      descricao:
        'Whey concentrado com rapida absorcao e aminoacidos essenciais para ganho de massa e recuperacao.',
      slug: 'whey-protein-max-titanium-900g',
      weight: '900g',
      preco: 49.99,
      estoque: 100,
      categoria: 'proteina',
      images: ['images/painelgaak.png'],
      benefits: ['Alta concentracao de proteina', 'Recuperacao e crescimento', 'Facil digestao'],
      inStock: true,
      ativo: true,
    },
    {
      nome: 'Pre-Workout Max Titanium 300g',
      descricao:
        'Pre-treino com foco e energia para treinos intensos.',
      slug: 'pre-workout-max-titanium-300g',
      weight: '300g',
      preco: 139.9,
      estoque: 80,
      categoria: 'pre-treino',
      images: ['images/painelgaak.png'],
      benefits: ['Foco e energia imediata', 'Mais resistencia', 'Performance elevada'],
      inStock: true,
      ativo: true,
    },
    {
      nome: 'BCAA 2:1:1 200g',
      descricao: 'Aminoacidos para recuperacao muscular e protecao da massa magra.',
      slug: 'bcaa-211-200g',
      weight: '200g',
      preco: 76.9,
      estoque: 60,
      categoria: 'aminoacidos',
      images: ['images/painelgaak.png'],
      benefits: ['Menos fadiga muscular', 'Recuperacao acelerada', 'Protecao da massa magra'],
      inStock: true,
      ativo: true,
    },
    {
      nome: 'Glutamina 300g',
      descricao: 'L-Glutamina para suporte imunologico e recuperacao muscular.',
      slug: 'glutamina-300g',
      weight: '300g',
      preco: 79.9,
      estoque: 60,
      categoria: 'aminoacidos',
      images: ['images/painelgaak.png'],
      benefits: ['Suporte imunologico', 'Recuperacao muscular', 'Menos catabolismo'],
      inStock: true,
      ativo: true,
    },
    {
      nome: 'Hipercalorico 3kg',
      descricao: 'Hipercalorico para ganho de massa com alta densidade calorica.',
      slug: 'hipercalorico-3kg',
      weight: '3kg',
      preco: 109.9,
      estoque: 50,
      categoria: 'hipercalorico',
      images: ['images/painelgaak.png'],
      benefits: ['Ganho de massa rapido', 'Alta densidade calorica', 'Mais energia no dia a dia'],
      inStock: true,
      ativo: true,
    },
  ];
}

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(getSeedProducts());
  }
}

function normalizeProductPayload(payload) {
  const preco = Number(payload.preco ?? payload.price ?? 0);
  const estoque = Number(payload.estoque ?? 0);

  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean)
    : payload.img
      ? [payload.img]
      : ['images/painelgaak.png'];

  return {
    nome: payload.nome ?? payload.name ?? '',
    descricao: payload.descricao ?? payload.description ?? '',
    slug: payload.slug ?? '',
    weight: payload.weight ?? '',
    preco,
    estoque,
    categoria: payload.categoria ?? payload.category ?? 'outro',
    img: images[0],
    images,
    benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
    inStock: payload.inStock ?? estoque > 0,
    ativo: payload.ativo ?? true,
  };
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    await seedProducts();

    const { id } = req.query;

    if (req.method === 'GET') {
      const products = await Product.find({ ativo: true }).sort({ createdAt: -1 });
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const normalized = normalizeProductPayload(req.body || {});
      if (!normalized.nome || !normalized.preco) {
        return res.status(400).json({ error: 'Nome e preco sao obrigatorios' });
      }
      const product = new Product(normalized);
      await product.save();
      return res.status(201).json(product);
    }

    if (req.method === 'PUT' && id) {
      const normalized = normalizeProductPayload(req.body || {});
      const product = await Product.findByIdAndUpdate(id, normalized, { new: true });
      if (!product) return res.status(404).json({ error: 'Produto nao encontrado' });
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE' && id) {
      const product = await Product.findByIdAndUpdate(id, { ativo: false }, { new: true });
      if (!product) return res.status(404).json({ error: 'Produto nao encontrado' });
      return res.status(200).json({ message: 'Produto removido' });
    }

    return res.status(405).json({ error: 'Metodo nao permitido' });
  } catch (error) {
    console.error('Erro em products:', error);
    return res.status(500).json({ error: error.message });
  }
};
