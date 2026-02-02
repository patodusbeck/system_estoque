import User from '../models/User.js';

/**
 * Registrar novo usuário
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso.'
      });
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password
    });

    // Gerar tokens
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuário
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    // Gerar tokens
    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter perfil do usuário logado
 */
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renovar token usando refresh token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token não fornecido.'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuário
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    // Gerar novos tokens
    const newToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido ou expirado.'
    });
  }
};
