import Product from '../models/Product.js';
import productService from '../services/productService.js';

/**
 * Criar novo produto
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      userId: req.user._id
    };

    // Se houver imagem, adicionar URL
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Listar produtos com filtros e paginação
 */
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, category, sortBy = 'expirationDate', order = 'asc' } = req.query;

    // Construir query de filtros
    const filters = { status, search, category };
    const query = productService.buildFilterQuery(filters, req.user._id);

    // Configurar paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Configurar ordenação
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Buscar produtos
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total de documentos
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter produto por ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar produto
 */
export const updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Se houver nova imagem, atualizar URL
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Excluir produto
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produto excluído com sucesso!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter estatísticas dos produtos
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await productService.getStatistics(req.user._id);

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter alertas de produtos próximos ao vencimento
 */
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await productService.getExpiryAlerts(req.user._id);

    res.status(200).json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    next(error);
  }
};
