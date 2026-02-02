import aiService from '../services/aiService.js';
import path from 'path';

/**
 * Analisar imagem e extrair informações do produto
 */
export const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada.'
      });
    }

    // Caminho completo da imagem
    const imagePath = req.file.path;

    // Analisar imagem usando IA
    const extractedData = await aiService.analyzeImage(imagePath);

    res.status(200).json({
      success: true,
      message: 'Imagem analisada com sucesso!',
      data: {
        extracted: extractedData,
        imageUrl: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
};
