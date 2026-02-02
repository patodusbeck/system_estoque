import Tesseract from 'tesseract.js';
import axios from 'axios';

class AIService {
  /**
   * Analisa uma imagem e extrai informações do produto
   * @param {string} imagePath - Caminho da imagem
   * @returns {Promise<Object>} - Dados extraídos
   */
  async analyzeImage(imagePath) {
    try {
      const extractedData = {
        barcode: null,
        description: null,
        expirationDate: null,
        confidence: 0
      };

      // Usar Tesseract.js para OCR
      const ocrResult = await this.performOCR(imagePath);
      
      if (ocrResult.text) {
        // Extrair código de barras (números de 8-13 dígitos)
        const barcodeMatch = ocrResult.text.match(/\b\d{8,13}\b/);
        if (barcodeMatch) {
          extractedData.barcode = barcodeMatch[0];
          extractedData.confidence += 0.3;

          // Tentar buscar informações do produto usando o código de barras
          const productInfo = await this.getProductInfoByBarcode(extractedData.barcode);
          if (productInfo) {
            extractedData.description = productInfo.description;
            extractedData.confidence += 0.4;
          }
        }

        // Extrair data de validade (formatos: DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY)
        const datePatterns = [
          /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/,  // DD/MM/YYYY ou DD-MM-YYYY
          /\b(\d{2})(\d{2})(\d{4})\b/,              // DDMMYYYY
          /VAL[:\s]*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,  // VAL: DD/MM/YYYY
          /VALIDADE[:\s]*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i  // VALIDADE: DD/MM/YYYY
        ];

        for (const pattern of datePatterns) {
          const dateMatch = ocrResult.text.match(pattern);
          if (dateMatch) {
            const day = dateMatch[1];
            const month = dateMatch[2];
            const year = dateMatch[3];
            
            // Validar data
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime())) {
              extractedData.expirationDate = date.toISOString().split('T')[0];
              extractedData.confidence += 0.3;
              break;
            }
          }
        }
      }

      return extractedData;
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      throw new Error('Erro ao processar imagem');
    }
  }

  /**
   * Realiza OCR na imagem usando Tesseract.js
   * @param {string} imagePath - Caminho da imagem
   * @returns {Promise<Object>} - Resultado do OCR
   */
  async performOCR(imagePath) {
    try {
      const result = await Tesseract.recognize(
        imagePath,
        'por', // Português
        {
          logger: info => {
            if (info.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
            }
          }
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence
      };
    } catch (error) {
      console.error('Erro no OCR:', error);
      throw new Error('Erro ao realizar OCR');
    }
  }

  /**
   * Busca informações do produto usando código de barras na API Open Food Facts
   * @param {string} barcode - Código de barras
   * @returns {Promise<Object|null>} - Informações do produto
   */
  async getProductInfoByBarcode(barcode) {
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { timeout: 5000 }
      );

      if (response.data.status === 1 && response.data.product) {
        const product = response.data.product;
        return {
          description: product.product_name || product.product_name_pt || null,
          brand: product.brands || null,
          category: product.categories || null
        };
      }

      return null;
    } catch (error) {
      console.log('Produto não encontrado no Open Food Facts');
      return null;
    }
  }

  /**
   * Extrai texto de regiões específicas da imagem (futuro: Google Vision API)
   * @param {string} imagePath - Caminho da imagem
   * @returns {Promise<Object>} - Texto extraído
   */
  async extractTextWithGoogleVision(imagePath) {
    // Placeholder para futura integração com Google Vision API
    // Requer configuração do GOOGLE_APPLICATION_CREDENTIALS
    throw new Error('Google Vision API não implementada ainda');
  }
}

export default new AIService();
