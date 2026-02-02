import express from 'express';
import { register, login, getProfile, refreshToken } from '../controllers/authController.js';
import { registerValidation, loginValidation, validate } from '../middleware/validators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshToken);

// Rotas protegidas
router.get('/profile', protect, getProfile);

export default router;
