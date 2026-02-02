import { body, validationResult } from 'express-validator';

// Middleware para verificar resultados da validação
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validadores para registro de usuário
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

// Validadores para login
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Validadores para criação de produto
export const createProductValidation = [
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 3 }).withMessage('Descrição deve ter no mínimo 3 caracteres'),
  
  body('batch')
    .trim()
    .notEmpty().withMessage('Lote é obrigatório'),
  
  body('supplier')
    .trim()
    .notEmpty().withMessage('Fornecedor é obrigatório'),
  
  body('quantity')
    .notEmpty().withMessage('Quantidade é obrigatória')
    .isNumeric().withMessage('Quantidade deve ser um número')
    .custom(value => value >= 0).withMessage('Quantidade não pode ser negativa'),
  
  body('unit')
    .optional()
    .isIn(['un', 'kg', 'l']).withMessage('Unidade deve ser: un, kg ou l'),
  
  body('manufacturingDate')
    .notEmpty().withMessage('Data de fabricação é obrigatória')
    .isISO8601().withMessage('Data de fabricação inválida'),
  
  body('expirationDate')
    .notEmpty().withMessage('Data de validade é obrigatória')
    .isISO8601().withMessage('Data de validade inválida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.manufacturingDate)) {
        throw new Error('Data de validade deve ser posterior à data de fabricação');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .trim(),
  
  body('barcode')
    .optional()
    .trim()
];

// Validadores para atualização de produto
export const updateProductValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Descrição deve ter no mínimo 3 caracteres'),
  
  body('batch')
    .optional()
    .trim(),
  
  body('supplier')
    .optional()
    .trim(),
  
  body('quantity')
    .optional()
    .isNumeric().withMessage('Quantidade deve ser um número')
    .custom(value => value >= 0).withMessage('Quantidade não pode ser negativa'),
  
  body('unit')
    .optional()
    .isIn(['un', 'kg', 'l']).withMessage('Unidade deve ser: un, kg ou l'),
  
  body('manufacturingDate')
    .optional()
    .isISO8601().withMessage('Data de fabricação inválida'),
  
  body('expirationDate')
    .optional()
    .isISO8601().withMessage('Data de validade inválida'),
  
  body('category')
    .optional()
    .trim(),
  
  body('barcode')
    .optional()
    .trim()
];
