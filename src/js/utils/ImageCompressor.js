/**
 * ImageCompressor - Compressor pragmático de imagens
 * Filosofia: Comprimir apenas quando necessário, manter qualidade visual
 */

class ImageCompressor {
  constructor() {
    this.config = {
      // Limites razoáveis
      maxWidth: 800,          // Largura máxima para web
      maxHeight: 600,         // Altura máxima para web
      quality: 0.8,           // 80% de qualidade (bom equilíbrio)
      maxFileSize: 200 * 1024, // 200KB máximo
      skipIfSmall: 100 * 1024  // Não comprimir se < 100KB
    };
  }

  /**
   * Comprimir imagem se necessário
   */
  async compress(file, options = {}) {
    // Configuração personalizada
    const config = { ...this.config, ...options };

    try {
      // 1. Verificar se precisa comprimir
      if (!this.needsCompression(file, config)) {
        console.log(`Imagem pequena (${this.formatFileSize(file.size)}), pulando compressão`);
        return file;
      }

      console.log(`Comprimindo: ${file.name} (${this.formatFileSize(file.size)})`);

      // 2. Criar canvas para redimensionar
      const canvas = await this.createCanvas(file, config);
      
      // 3. Tentar diferentes níveis de qualidade até atingir tamanho desejado
      const compressed = await this.compressWithQualityAdjustment(canvas, file.name, config);
      
      console.log(`Compressão concluída: ${this.formatFileSize(file.size)} → ${this.formatFileSize(compressed.size)} (${Math.round((compressed.size/file.size)*100)}%)`);
      
      return compressed;

    } catch (error) {
      console.warn('Falha na compressão, usando imagem original:', error);
      return file;
    }
  }

  /**
   * Verificar se imagem precisa ser comprimida
   */
  needsCompression(file, config) {
    // Não é imagem? Não comprimir
    if (!file.type.startsWith('image/')) {
      return false;
    }

    // SVG? Não comprimir (já otimizado)
    if (file.type === 'image/svg+xml') {
      return false;
    }

    // Muito pequena? Não comprimir
    if (file.size < config.skipIfSmall) {
      return false;
    }

    return true;
  }

  /**
   * Criar canvas redimensionado
   */
  async createCanvas(file, config) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular dimensões mantendo proporção
          const dimensions = this.calculateDimensions(
            img.width, 
            img.height, 
            config.maxWidth, 
            config.maxHeight
          );
          
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          
          // Otimizações de qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
          
          resolve(canvas);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calcular dimensões respeitando aspect ratio
   */
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Reduzir largura se necessário
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    
    // Reduzir altura se necessário
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }
    
    // Garantir dimensões inteiras
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Comprimir ajustando qualidade até atingir tamanho desejado
   */
  async compressWithQualityAdjustment(canvas, fileName, config) {
    let quality = config.quality;
    let compressed = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      compressed = await this.canvasToFile(canvas, fileName, quality);
      
      // Atingiu tamanho desejado ou qualidade mínima?
      if (compressed.size <= config.maxFileSize || quality <= 0.3) {
        break;
      }
      
      // Reduzir qualidade para próxima tentativa
      quality -= 0.1;
      attempts++;
    }

    return compressed;
  }

  /**
   * Converter canvas para arquivo
   */
  async canvasToFile(canvas, fileName, quality) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        // Criar arquivo a partir do blob
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(file);
      }, 'image/jpeg', quality);
    });
  }

  /**
   * Comprimir múltiplas imagens
   */
  async compressMultiple(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const compressed = await this.compress(file, options);
        results.push({
          original: file,
          compressed,
          success: true,
          savings: Math.round(((file.size - compressed.size) / file.size) * 100)
        });
      } catch (error) {
        results.push({
          original: file,
          compressed: file,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Obter info da imagem sem carregar completamente
   */
  async getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            fileSize: file.size,
            fileType: file.type,
            fileName: file.name
          });
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validar se arquivo é imagem válida
   */
  validateImage(file) {
    const validTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/webp',
      'image/svg+xml'
    ];

    if (!validTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }

    // Limites razoáveis
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande: ${this.formatFileSize(file.size)} (máx: 10MB)`);
    }

    return true;
  }

  /**
   * Formatar tamanho de arquivo para exibição
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Configurar compressor
   */
  configure(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Resetar configuração para padrões
   */
  resetConfig() {
    this.config = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8,
      maxFileSize: 200 * 1024,
      skipIfSmall: 100 * 1024
    };
  }
}

// Exportar instância única
export default new ImageCompressor();