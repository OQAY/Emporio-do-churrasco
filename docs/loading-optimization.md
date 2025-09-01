# 🚀 Roadmap de Otimização de Performance

## Problemas Identificados

### 🐌 1. Carregamento Inicial Lento (até 15s)
- Busca todos os dados do Supabase a cada visita
- Imagens grandes sem otimização
- Sem cache local dos dados

### ❌ 2. Falha ao Recarregar Após Inatividade
- Dados do Supabase não carregam após 1-2 horas
- Possível expiração de token/sessão
- Sem fallback para dados offline

### 📈 3. Escalabilidade Multi-tenant
- Sistema precisa suportar múltiplos restaurantes
- Performance deve se manter com crescimento

## Solução Pragmática: Cache-First + Progressive Enhancement

### Filosofia da Solução
> "O melhor cardápio é o que carrega rápido. Sempre."

- **Offline-first**: localStorage como fonte primária
- **Sync inteligente**: Atualizar apenas quando necessário
- **Progressive**: Melhorar experiência conforme recursos disponíveis

## Fase 1: Cache Agressivo (1-2 dias) ⚡

### 1.1 Implementar CacheManager Simples

```javascript
// src/js/services/CacheManager.js
class CacheManager {
  constructor() {
    this.CACHE_VERSION = 'v1';
    this.CACHE_DURATION = 1000 * 60 * 60; // 1 hora
  }

  // Salvar com timestamp
  set(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: this.CACHE_VERSION
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  }

  // Buscar com validação de idade
  get(key, maxAge = this.CACHE_DURATION) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { data, timestamp, version } = JSON.parse(cached);
      
      // Cache válido?
      if (version === this.CACHE_VERSION && 
          Date.now() - timestamp < maxAge) {
        return data;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Limpar cache antigo
  clear(key) {
    if (key) {
      localStorage.removeItem(`cache_${key}`);
    } else {
      // Limpar todo cache
      Object.keys(localStorage)
        .filter(k => k.startsWith('cache_'))
        .forEach(k => localStorage.removeItem(k));
    }
  }
}

export default new CacheManager();
```

### 1.2 Modificar database.js para Cache-First

```javascript
// src/js/database.js - adicionar ao início da classe
import CacheManager from './services/CacheManager.js';

class Database {
  async loadProducts() {
    // 1. Tentar cache primeiro (instantâneo!)
    const cached = CacheManager.get('produtos', 1000 * 60 * 30); // 30 min
    if (cached) {
      this.produtos = cached;
      this.notifyObservers('produtos');
      
      // 2. Atualizar em background (não bloqueia)
      this.refreshProductsInBackground();
      return cached;
    }
    
    // 3. Se não tem cache, buscar normal
    return this.fetchProductsFromSupabase();
  }
  
  async refreshProductsInBackground() {
    try {
      const fresh = await this.fetchProductsFromSupabase();
      if (fresh) {
        CacheManager.set('produtos', fresh);
      }
    } catch (error) {
      // Falhou? Sem problemas, temos cache
      console.log('Background refresh failed, using cache');
    }
  }
}
```

## Fase 2: Compressão de Imagens (1 dia) 📸

### 2.1 Compressor de Imagens no Upload

```javascript
// src/js/utils/ImageCompressor.js
class ImageCompressor {
  async compress(file, maxWidth = 800, quality = 0.8) {
    // Pragmático: se < 100KB, nem comprime
    if (file.size < 100 * 1024) {
      return file;
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Calcular dimensões mantendo proporção
          let { width, height } = img;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para blob otimizado
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
}

export default new ImageCompressor();
```

### 2.2 Integrar no Admin

```javascript
// src/js/admin.js - modificar handleImageUpload
import ImageCompressor from './utils/ImageCompressor.js';

async handleImageUpload(file) {
  // Comprimir antes de converter para base64
  const compressed = await ImageCompressor.compress(file);
  
  // Agora sim, converter para base64
  const reader = new FileReader();
  reader.onload = (e) => {
    this.productImage = e.target.result;
    // mostrar preview...
  };
  reader.readAsDataURL(compressed);
}
```

## Fase 3: Service Worker Inteligente (2 dias) 🔧

### 3.1 Atualizar sw.js

```javascript
// sw.js - estratégia cache-first com fallback
const CACHE_NAME = 'emporio-v2';
const STATIC_CACHE = 'static-v2';

// Assets estáticos (nunca mudam)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/src/styles/main.css',
  '/src/styles/admin.css',
  '/src/js/app.js',
  '/src/js/admin.js'
];

// Instalar e cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Estratégia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API calls - network first, cache fallback
  if (url.pathname.includes('/api/') || 
      url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache resposta válida
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline? Usar cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Assets estáticos - cache first
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
```

## Fase 4: Estratégia de Dados (1 dia) 💾

### 4.1 Três Camadas de Dados

```javascript
// src/js/services/DataStrategy.js
class DataStrategy {
  constructor() {
    this.layers = {
      memory: {},      // RAM - instantâneo
      local: null,     // localStorage - rápido
      remote: null     // Supabase - completo
    };
  }
  
  async getData(key) {
    // 1. Memória (0ms)
    if (this.layers.memory[key]) {
      return this.layers.memory[key];
    }
    
    // 2. localStorage (1-5ms)
    const local = localStorage.getItem(key);
    if (local) {
      this.layers.memory[key] = JSON.parse(local);
      this.refreshInBackground(key); // não bloqueia
      return this.layers.memory[key];
    }
    
    // 3. Supabase (100-5000ms)
    return this.fetchFromRemote(key);
  }
  
  async refreshInBackground(key) {
    setTimeout(async () => {
      try {
        const fresh = await this.fetchFromRemote(key);
        if (fresh) {
          this.layers.memory[key] = fresh;
          localStorage.setItem(key, JSON.stringify(fresh));
        }
      } catch {
        // Silencioso - já temos dados locais
      }
    }, 1000); // Aguarda 1s para não competir com render inicial
  }
}
```

## Fase 5: Quick Wins (meio dia) 🎯

### 5.1 Lazy Loading de Imagens

```javascript
// src/js/utils/LazyLoader.js
class LazyLoader {
  init() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}
```

### 5.2 Skeleton Loading

```css
/* src/styles/main.css */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.product-skeleton {
  height: 200px;
  border-radius: 8px;
  margin-bottom: 1rem;
}
```

## Implementação Pragmática

### Prioridade 1 (Fazer HOJE)
1. ✅ Implementar CacheManager
2. ✅ Modificar database.js para cache-first
3. ✅ Adicionar skeleton loading

### Prioridade 2 (Fazer AMANHÃ)
1. ⏳ Compressor de imagens
2. ⏳ Service Worker atualizado
3. ⏳ Lazy loading

### Prioridade 3 (Fazer DEPOIS)
1. ⏰ Estratégia de três camadas
2. ⏰ Otimizações adicionais
3. ⏰ Monitoring de performance

## Métricas de Sucesso 📊

### Antes
- ❌ Carregamento inicial: 15 segundos
- ❌ Dados após inatividade: Falha
- ❌ Imagens grandes: 3-5MB cada

### Depois (Meta)
- ✅ Carregamento inicial: < 2 segundos
- ✅ Dados após inatividade: Sempre funciona (cache)
- ✅ Imagens otimizadas: < 200KB cada

## Código de Exemplo - Implementação Imediata

### database.js modificado (COPIAR E COLAR)

```javascript
// Adicionar no início do arquivo database.js
const CACHE_DURATION = {
  produtos: 30 * 60 * 1000,    // 30 minutos
  categorias: 60 * 60 * 1000,   // 1 hora
  config: 24 * 60 * 60 * 1000   // 24 horas
};

class Database {
  constructor() {
    this.produtos = [];
    this.categorias = [];
    this.config = {};
    this.observers = [];
    this.cachePrefix = 'emporio_cache_';
  }
  
  // Método genérico de cache
  getCached(key, maxAge) {
    try {
      const cached = localStorage.getItem(this.cachePrefix + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp < maxAge) {
        return data;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  setCache(key, data) {
    localStorage.setItem(this.cachePrefix + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }
  
  async loadProducts() {
    // 1. Cache instantâneo
    const cached = this.getCached('produtos', CACHE_DURATION.produtos);
    if (cached) {
      this.produtos = cached;
      this.notifyObservers('produtos');
      
      // 2. Atualizar silenciosamente
      this.refreshProducts();
      return cached;
    }
    
    // 3. Buscar se não tem cache
    try {
      const data = await this.fetchFromSupabase('produtos');
      this.produtos = data;
      this.setCache('produtos', data);
      this.notifyObservers('produtos');
      return data;
    } catch (error) {
      // 4. Fallback para localStorage antigo
      const fallback = localStorage.getItem('menu_produtos');
      if (fallback) {
        this.produtos = JSON.parse(fallback);
        return this.produtos;
      }
      throw error;
    }
  }
  
  async refreshProducts() {
    // Background refresh - não bloqueia
    setTimeout(async () => {
      try {
        const fresh = await this.fetchFromSupabase('produtos');
        if (JSON.stringify(fresh) !== JSON.stringify(this.produtos)) {
          this.produtos = fresh;
          this.setCache('produtos', fresh);
          this.notifyObservers('produtos');
        }
      } catch {
        // Silencioso - já temos dados
      }
    }, 2000);
  }
}
```

## Testes de Validação

### 1. Teste de Cache
```javascript
// Console do browser
localStorage.clear();
// Recarregar página - deve buscar do Supabase
// Recarregar novamente - deve vir do cache (instantâneo)
```

### 2. Teste Offline
```javascript
// DevTools > Network > Offline
// Recarregar - deve funcionar com cache
```

### 3. Teste de Performance
```javascript
// DevTools > Performance > Record
// Recarregar página
// Target: First Contentful Paint < 2s
```

## Observações Importantes

### ⚠️ Não fazer (over-engineering)
- ❌ Implementar GraphQL
- ❌ Adicionar Redis
- ❌ Criar micro-serviços
- ❌ Usar Web Workers para tudo
- ❌ Implementar Virtual DOM

### ✅ Fazer (pragmático)
- ✅ localStorage como cache principal
- ✅ Comprimir imagens no client
- ✅ Service Worker simples
- ✅ Lazy loading nativo
- ✅ Refresh em background

## Resultado Esperado

Com essas otimizações simples e pragmáticas:

1. **Carregamento inicial**: de 15s → 2s (cache local)
2. **Após inatividade**: sempre funciona (offline-first)
3. **Imagens**: de 3MB → 200KB (compressão)
4. **UX**: instantânea com atualizações em background

## Próximos Passos

1. Implementar Fase 1 (Cache) - **HOJE**
2. Testar em conexão lenta
3. Implementar Fase 2 (Imagens) - **AMANHÃ**
4. Medir melhorias
5. Ajustar conforme necessário

---

**Lembre-se**: O melhor código é o que entrega valor. Não o mais complexo.