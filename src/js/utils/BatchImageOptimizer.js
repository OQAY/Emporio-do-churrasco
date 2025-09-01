/**
 * BatchImageOptimizer - Comprimir imagens existentes na base de dados
 * Filosofia: Pragmático, com backup e progress, sem quebrar nada
 */

import ImageCompressor from './ImageCompressor.js';

class BatchImageOptimizer {
  constructor(database) {
    this.database = database;
    this.isRunning = false;
    this.progress = {
      total: 0,
      current: 0,
      optimized: 0,
      skipped: 0,
      errors: 0,
      savings: 0
    };
  }

  /**
   * Comprimir todas as imagens existentes na base de dados
   */
  async optimizeAllImages(options = {}) {
    if (this.isRunning) {
      throw new Error('Otimização já está em andamento');
    }

    const config = {
      createBackup: true,           // Backup das originais
      skipIfOptimized: true,        // Pular se já otimizada
      maxConcurrent: 2,             // Máx 2 simultâneas (não travar)
      onProgress: null,             // Callback de progresso
      ...options
    };

    console.log('🚀 Iniciando otimização de imagens existentes...');
    
    try {
      this.isRunning = true;
      this.resetProgress();

      // 1. Buscar todas as imagens
      const images = await this.getAllImages();
      this.progress.total = images.length;

      if (images.length === 0) {
        console.log('📷 Nenhuma imagem encontrada para otimizar');
        return this.progress;
      }

      console.log(`📷 Encontradas ${images.length} imagens para analisar`);

      // 2. Criar backup se solicitado
      if (config.createBackup) {
        await this.createBackup(images);
      }

      // 3. Processar em lotes pequenos
      await this.processBatch(images, config);

      console.log('✅ Otimização concluída!');
      console.log(`💾 Economia total: ${this.formatFileSize(this.progress.savings)}`);
      
      return this.progress;

    } catch (error) {
      console.error('❌ Erro na otimização:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Buscar todas as imagens da base de dados
   */
  async getAllImages() {
    const images = [];

    try {
      const data = this.database.getData();
      if (!data) return images;

      // 1. Imagens de produtos
      if (data.products) {
        data.products.forEach(product => {
          if (product.image && this.isBase64Image(product.image)) {
            images.push({
              type: 'product',
              id: product.id,
              name: product.name,
              imageData: product.image,
              location: `products[${product.id}].image`
            });
          }
        });
      }

      // 2. Banner do restaurante
      if (data.restaurant?.banner && this.isBase64Image(data.restaurant.banner)) {
        images.push({
          type: 'banner',
          id: 'restaurant-banner',
          name: 'Banner do Restaurante',
          imageData: data.restaurant.banner,
          location: 'restaurant.banner'
        });
      }

      // 3. Logo do restaurante
      if (data.restaurant?.logo && this.isBase64Image(data.restaurant.logo)) {
        images.push({
          type: 'logo',
          id: 'restaurant-logo',
          name: 'Logo do Restaurante',
          imageData: data.restaurant.logo,
          location: 'restaurant.logo'
        });
      }

      // 4. Galeria de imagens
      if (data.gallery) {
        data.gallery.forEach(img => {
          if (img.url && this.isBase64Image(img.url)) {
            images.push({
              type: 'gallery',
              id: img.id,
              name: img.name,
              imageData: img.url,
              location: `gallery[${img.id}].url`
            });
          }
        });
      }

    } catch (error) {
      console.warn('Erro ao buscar imagens:', error);
    }

    return images;
  }

  /**
   * Verificar se é imagem base64
   */
  isBase64Image(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return false;
    return dataUrl.startsWith('data:image/') && dataUrl.includes('base64,');
  }

  /**
   * Processar imagens em lotes
   */
  async processBatch(images, config) {
    const batchSize = config.maxConcurrent;
    
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      // Processar lote em paralelo
      const promises = batch.map(img => this.processImage(img, config));
      await Promise.allSettled(promises);
      
      // Callback de progresso
      if (config.onProgress) {
        config.onProgress(this.progress);
      }
      
      // Pausa entre lotes para não travar
      await this.sleep(100);
    }
  }

  /**
   * Processar uma imagem individual
   */
  async processImage(imageInfo, config) {
    try {
      this.progress.current++;
      console.log(`🔄 [${this.progress.current}/${this.progress.total}] ${imageInfo.name}`);

      // 1. Converter base64 para File
      const file = await this.base64ToFile(imageInfo.imageData, imageInfo.name);
      
      // 2. Verificar se precisa otimizar
      if (config.skipIfOptimized && !this.needsOptimization(file)) {
        console.log(`⏭️  Pulando ${imageInfo.name} (já otimizada)`);
        this.progress.skipped++;
        return;
      }

      // 3. Comprimir
      const originalSize = file.size;
      const compressedFile = await ImageCompressor.compress(file);
      
      // 4. Verificar se houve economia significativa
      const savings = originalSize - compressedFile.size;
      const savingsPercent = (savings / originalSize) * 100;
      
      if (savingsPercent < 10) {
        console.log(`⏭️  Pulando ${imageInfo.name} (economia < 10%)`);
        this.progress.skipped++;
        return;
      }

      // 5. Converter de volta para base64
      const optimizedBase64 = await this.fileToBase64(compressedFile);
      
      // 6. Atualizar na base de dados
      await this.updateImageInDatabase(imageInfo, optimizedBase64);
      
      this.progress.optimized++;
      this.progress.savings += savings;
      
      console.log(`✅ ${imageInfo.name}: ${this.formatFileSize(originalSize)} → ${this.formatFileSize(compressedFile.size)} (-${Math.round(savingsPercent)}%)`);

    } catch (error) {
      console.error(`❌ Erro em ${imageInfo.name}:`, error);
      this.progress.errors++;
    }
  }

  /**
   * Verificar se imagem precisa otimização
   */
  needsOptimization(file) {
    const maxSize = 300 * 1024; // 300KB
    return file.size > maxSize;
  }

  /**
   * Converter base64 para File
   */
  async base64ToFile(dataUrl, fileName) {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  /**
   * Converter File para base64
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Atualizar imagem na base de dados
   */
  async updateImageInDatabase(imageInfo, optimizedBase64) {
    const data = this.database.getData();
    
    // Navegação baseada na localização
    const path = imageInfo.location.split('.');
    let current = data;
    
    // Navegar até o local da imagem
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      
      // Handle array access [id]
      if (key.includes('[') && key.includes(']')) {
        const [arrayName, id] = this.parseArrayAccess(key);
        current = current[arrayName];
        current = current.find(item => item.id === id);
      } else {
        current = current[key];
      }
    }
    
    // Atualizar o valor final
    const finalKey = path[path.length - 1];
    current[finalKey] = optimizedBase64;
    
    // Salvar alterações
    this.database.saveData(data);
  }

  /**
   * Parse array access like "products[prod1]"
   */
  parseArrayAccess(key) {
    const match = key.match(/(\w+)\[([^\]]+)\]/);
    return match ? [match[1], match[2]] : [key, null];
  }

  /**
   * Criar backup das imagens originais
   */
  async createBackup(images) {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        images: images.map(img => ({
          location: img.location,
          originalSize: this.getBase64Size(img.imageData),
          imageData: img.imageData
        }))
      };

      // Salvar backup no localStorage
      localStorage.setItem('imageBackup_' + Date.now(), JSON.stringify(backup));
      console.log(`💾 Backup criado com ${images.length} imagens`);
      
    } catch (error) {
      console.warn('⚠️  Falha ao criar backup:', error);
    }
  }

  /**
   * Restaurar backup (se necessário)
   */
  async restoreFromBackup(backupKey) {
    try {
      const backup = JSON.parse(localStorage.getItem(backupKey));
      if (!backup) throw new Error('Backup não encontrado');

      const data = this.database.getData();
      
      // Restaurar cada imagem
      backup.images.forEach(img => {
        const path = img.location.split('.');
        let current = data;
        
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (key.includes('[') && key.includes(']')) {
            const [arrayName, id] = this.parseArrayAccess(key);
            current = current[arrayName];
            current = current.find(item => item.id === id);
          } else {
            current = current[key];
          }
        }
        
        const finalKey = path[path.length - 1];
        current[finalKey] = img.imageData;
      });
      
      this.database.saveData(data);
      console.log('✅ Backup restaurado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  /**
   * Listar backups disponíveis
   */
  getAvailableBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('imageBackup_')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key));
          backups.push({
            key,
            timestamp: backup.timestamp,
            imageCount: backup.images.length,
            totalSize: backup.images.reduce((sum, img) => sum + img.originalSize, 0)
          });
        } catch (error) {
          console.warn('Backup corrompido:', key);
        }
      }
    }
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Utilitários
   */
  getBase64Size(dataUrl) {
    // Aproximação do tamanho real
    return Math.round((dataUrl.length * 3) / 4);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  resetProgress() {
    this.progress = {
      total: 0,
      current: 0,
      optimized: 0,
      skipped: 0,
      errors: 0,
      savings: 0
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obter progresso atual
   */
  getProgress() {
    return {
      ...this.progress,
      percentage: this.progress.total > 0 ? Math.round((this.progress.current / this.progress.total) * 100) : 0,
      isRunning: this.isRunning
    };
  }
}

export default BatchImageOptimizer;