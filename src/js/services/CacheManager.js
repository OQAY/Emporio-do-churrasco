/**
 * CacheManager - Sistema pragmático de cache local
 * Filosofia: Cache agressivo com refresh em background
 */

class CacheManager {
  constructor() {
    this.CACHE_VERSION = 'v1';
    this.CACHE_PREFIX = 'emporio_cache_';
    
    // Durações padrão de cache
    this.DURATIONS = {
      produtos: 30 * 60 * 1000,      // 30 minutos
      categorias: 60 * 60 * 1000,     // 1 hora  
      config: 24 * 60 * 60 * 1000,    // 24 horas
      default: 30 * 60 * 1000         // 30 minutos padrão
    };
  }

  /**
   * Salvar dados no cache com timestamp
   */
  set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };
      
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return true;
    } catch (error) {
      console.warn('Cache write failed:', error);
      // Se localStorage estiver cheio, limpar caches antigos
      if (error.name === 'QuotaExceededError') {
        this.clearOldCaches();
        // Tentar novamente
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Buscar dados do cache com validação de idade
   */
  get(key, maxAge = null) {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const { data, timestamp, version } = JSON.parse(cached);
      
      // Verificar versão
      if (version !== this.CACHE_VERSION) {
        this.clear(key);
        return null;
      }
      
      // Determinar idade máxima
      const duration = maxAge || this.DURATIONS[key] || this.DURATIONS.default;
      
      // Cache ainda válido?
      if (Date.now() - timestamp < duration) {
        return data;
      }
      
      // Cache expirado
      return null;
      
    } catch (error) {
      console.warn('Cache read failed:', error);
      return null;
    }
  }

  /**
   * Verificar se cache existe e é válido
   */
  has(key, maxAge = null) {
    return this.get(key, maxAge) !== null;
  }

  /**
   * Buscar idade do cache em milissegundos
   */
  getAge(key) {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp;
      
    } catch {
      return null;
    }
  }

  /**
   * Limpar cache específico ou todos
   */
  clear(key = null) {
    try {
      if (key) {
        // Limpar cache específico
        const cacheKey = this.CACHE_PREFIX + key;
        localStorage.removeItem(cacheKey);
      } else {
        // Limpar todos os caches
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith(this.CACHE_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      }
      return true;
    } catch (error) {
      console.warn('Cache clear failed:', error);
      return false;
    }
  }

  /**
   * Limpar caches antigos (mais de 7 dias)
   */
  clearOldCaches() {
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          const { timestamp } = JSON.parse(cached);
          
          if (Date.now() - timestamp > MAX_AGE) {
            localStorage.removeItem(key);
          }
        } catch {
          // Cache corrompido, remover
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const stats = {
      totalCaches: 0,
      totalSize: 0,
      caches: []
    };
    
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        stats.totalCaches++;
        
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        stats.totalSize += size;
        
        try {
          const { timestamp } = JSON.parse(value);
          const age = Date.now() - timestamp;
          
          stats.caches.push({
            key: key.replace(this.CACHE_PREFIX, ''),
            size: Math.round(size / 1024) + 'KB',
            age: Math.round(age / 1000 / 60) + ' min'
          });
        } catch {
          // Ignorar caches corrompidos
        }
      }
    });
    
    stats.totalSize = Math.round(stats.totalSize / 1024) + 'KB';
    return stats;
  }

  /**
   * Invalidar cache (marcar como expirado mas não deletar)
   */
  invalidate(key) {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const cacheData = JSON.parse(cached);
        cacheData.timestamp = 0; // Forçar expiração
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

// Exportar instância única (singleton)
export default new CacheManager();