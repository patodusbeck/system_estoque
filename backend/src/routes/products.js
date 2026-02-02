import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getStats,
  getAlerts
} from '../controllers/productController.js';
import { createProductValidation, updateProductValidation, validate } from '../middleware/validators.js';
import { protect } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

// Rotas de estatísticas e alertas
router.get('/stats', getStats);
router.get('/alerts', getAlerts);

// CRUD de produtos
router.route('/')
  .get(getProducts)
  .post(upload.single('image'), createProductValidation, validate, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(upload.single('image'), updateProductValidation, validate, updateProduct)
  .delete(deleteProduct);

export default router;
