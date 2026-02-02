import cron from 'node-cron';
import Product from '../models/Product.js';

/**
 * Cron job para verificar produtos vencidos diariamente
 * Executa todos os dias às 00:00
 */
export const checkExpiredProducts = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🔍 Verificando produtos vencidos...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar produtos vencidos
      const expiredProducts = await Product.find({
        expirationDate: { $lt: today }
      });

      console.log(`⚠️ ${expiredProducts.length} produto(s) vencido(s) encontrado(s).`);

      // Aqui você pode adicionar lógica adicional, como:
      // - Enviar notificações por email
      // - Criar logs
      // - Atualizar status no banco de dados
      
      if (expiredProducts.length > 0) {
        expiredProducts.forEach(product => {
          console.log(`  - ${product.description} (Lote: ${product.batch}) - Vencido em ${product.expirationDate.toLocaleDateString('pt-BR')}`);
        });
      }

    } catch (error) {
      console.error('❌ Erro ao verificar produtos vencidos:', error);
    }
  });

  console.log('✅ Cron job de verificação de produtos iniciado (executa diariamente às 00:00)');
};

/**
 * Cron job para alertar sobre produtos próximos ao vencimento
 * Executa todos os dias às 08:00
 */
export const checkNearExpiryProducts = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('🔍 Verificando produtos próximos ao vencimento...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Buscar produtos que vencem nos próximos 7 dias
      const nearExpiryProducts = await Product.find({
        expirationDate: {
          $gte: today,
          $lte: sevenDaysFromNow
        }
      });

      console.log(`⚠️ ${nearExpiryProducts.length} produto(s) próximo(s) ao vencimento encontrado(s).`);

      if (nearExpiryProducts.length > 0) {
        nearExpiryProducts.forEach(product => {
          const daysUntil = Math.ceil((product.expirationDate - today) / (1000 * 60 * 60 * 24));
          console.log(`  - ${product.description} (Lote: ${product.batch}) - Vence em ${daysUntil} dia(s)`);
        });
      }

    } catch (error) {
      console.error('❌ Erro ao verificar produtos próximos ao vencimento:', error);
    }
  });

  console.log('✅ Cron job de alerta de vencimento iniciado (executa diariamente às 08:00)');
};

/**
 * Inicializar todos os cron jobs
 */
export const initCronJobs = () => {
  checkExpiredProducts();
  checkNearExpiryProducts();
};
