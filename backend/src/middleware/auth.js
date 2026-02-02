import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token está no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado. Token não fornecido.'
      });
    }

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário pelo ID do token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado.'
        });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado.',
          expired: true
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor ao validar token.'
    });
  }
};

// Middleware para verificar se o usuário é admin
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Usuário com role '${req.user.role}' não tem permissão para acessar esta rota.`
      });
    }
    next();
  };
};
