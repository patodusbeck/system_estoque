import Product from '../models/Product.js';

class ProductService {
  /**
   * Calcula estatísticas dos produtos
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStatistics(userId) {
    try {
      const products = await Product.find({ userId });

      const stats = {
        total: products.length,
        valid: 0,
        nearExpiry: 0,
        expired: 0,
        byCategory: {},
        recentlyAdded: []
      };

      products.forEach(product => {
        const status = product.status;
        
        // Contar por status
        if (status === 'valid') stats.valid++;
        else if (status === 'near_expiry') stats.nearExpiry++;
        else if (status === 'expired') stats.expired++;

        // Contar por categoria
        const category = product.category || 'Geral';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      // Produtos adicionados recentemente (últimos 5)
      stats.recentlyAdded = products
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(p => ({
          id: p._id,
          description: p.description,
          status: p.status,
          createdAt: p.createdAt
        }));

      return stats;
    } catch (error) {
      throw new Error('Erro ao calcular estatísticas');
    }
  }

  /**
   * Filtra produtos com base em critérios
   * @param {Object} filters - Filtros
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Query do Mongoose
   */
  buildFilterQuery(filters, userId) {
    const query = { userId };

    // Filtro por status
    if (filters.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.status === 'expired') {
        query.expirationDate = { $lt: today };
      } else if (filters.status === 'near_expiry') {
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        query.expirationDate = {
          $gte: today,
          $lte: sevenDaysFromNow
        };
      } else if (filters.status === 'valid') {
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        query.expirationDate = { $gt: sevenDaysFromNow };
      }
    }

    // Filtro por busca (descrição, lote, fornecedor)
    if (filters.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: 'i' } },
        { batch: { $regex: filters.search, $options: 'i' } },
        { supplier: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Filtro por categoria
    if (filters.category) {
      query.category = filters.category;
    }

    return query;
  }

  /**
   * Verifica produtos que estão vencendo e retorna alertas
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Produtos com alerta
   */
  async getExpiryAlerts(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Produtos que vencem nos próximos 7 dias ou já venceram
      const products = await Product.find({
        userId,
        expirationDate: { $lte: sevenDaysFromNow }
      }).sort({ expirationDate: 1 });

      return products.map(product => ({
        id: product._id,
        description: product.description,
        batch: product.batch,
        expirationDate: product.expirationDate,
        daysUntilExpiration: product.daysUntilExpiration,
        status: product.status,
        priority: product.status === 'expired' ? 'high' : 'medium'
      }));
    } catch (error) {
      throw new Error('Erro ao buscar alertas de validade');
    }
  }
}

export default new ProductService();
