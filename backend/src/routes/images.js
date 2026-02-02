import express from 'express';
import { analyzeImage } from '../controllers/imageController.js';
import { protect } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

// Rota de análise de imagem
router.post('/analyze', upload.single('image'), analyzeImage);

export default router;
