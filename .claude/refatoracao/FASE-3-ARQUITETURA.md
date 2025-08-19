# ⚡ FASE 3: ARQUITETURA & PERFORMANCE

## 🎯 OBJETIVO
Transformar o código de **"funciona mas é difícil de manter"** para **"escalável, maintível e performático"** - padrão Google/Facebook.

**⏰ DURAÇÃO:** 2 semanas (10 dias úteis)  
**🎯 PRIORIDADE:** 🟡 **MÉDIA-ALTA** - Afeta produtividade e performance

---

## 🚨 PROBLEMAS ARQUITETURAIS CRÍTICOS

### **1. HTML Inline Gigante (107 linhas)**
```javascript
// ❌ PROBLEMÁTICO ATUAL:
render() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <header class="sticky top-0...">
            // 107 linhas de HTML inline!!!
        </header>
    `;
}

// ✅ CORREÇÃO:
render() {
    this.templateEngine.render('app-layout', {
        restaurant: this.restaurant,
        categories: this.categories
    });
}
```

### **2. Responsabilidades Misturadas**
```javascript
// ❌ PROBLEMÁTICO: App.js faz TUDO
class App {
    render() { /* UI */ }
    setupEventListeners() { /* Events */ }
    loadInitialData() { /* Data */ }
    // Violação Single Responsibility Principle
}

// ✅ CORREÇÃO: Separação clara
class App {
    constructor() {
        this.layoutManager = new LayoutManager();
        this.eventBus = new EventBus();
        this.dataManager = new DataManager();
    }
}
```

### **3. Performance N+1 Problem**
```javascript
// ❌ PROBLEMÁTICO: O(n*m) complexity
categories.map(category => ({
    ...category,
    productCount: products.filter(product => 
        product.categoryId === category.id  // Loop dentro de loop!
    ).length
}));

// ✅ CORREÇÃO: O(n) complexity
const productCountMap = products.reduce((acc, product) => {
    acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
    return acc;
}, {});

const categoriesWithCount = categories.map(category => ({
    ...category,
    productCount: productCountMap[category.id] || 0
}));
```

---

## 📋 CHECKLIST DETALHADO

### **🏗️ SEMANA 1: REFATORAÇÃO ARQUITETURAL**

#### **DAY 1-2: Template System**

##### **Task 1.1: Instalar Template Engine**
```bash
npm install handlebars
npm install @types/handlebars
```

##### **Task 1.2: Criar Template Manager**
```javascript
// 📁 src/js/core/template-manager.js
import Handlebars from 'handlebars';

class TemplateManager {
    constructor() {
        this.templates = new Map();
        this.helpers = new Map();
        this.registerDefaultHelpers();
    }
    
    registerDefaultHelpers() {
        // Helper para formatação de preço
        this.registerHelper('formatPrice', (price) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(price);
        });
        
        // Helper para URLs de imagem
        this.registerHelper('imageUrl', (url, width = 400, height = 300) => {
            if (url.includes('unsplash.com')) {
                return `${url}&w=${width}&h=${height}&fit=crop`;
            }
            return url;
        });
        
        // Helper para classes condicionais
        this.registerHelper('conditional', (condition, truthyClass, falsyClass = '') => {
            return condition ? truthyClass : falsyClass;
        });
    }
    
    registerHelper(name, helperFunction) {
        Handlebars.registerHelper(name, helperFunction);
        this.helpers.set(name, helperFunction);
    }
    
    async loadTemplate(name, path) {
        try {
            const response = await fetch(path);
            const templateSource = await response.text();
            const compiledTemplate = Handlebars.compile(templateSource);
            
            this.templates.set(name, compiledTemplate);
            return compiledTemplate;
        } catch (error) {
            logger.error('Failed to load template', { name, path, error: error.message });
            throw new Error(`Template ${name} could not be loaded`);
        }
    }
    
    render(templateName, data = {}) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        
        try {
            return template(data);
        } catch (error) {
            logger.error('Template render failed', { 
                templateName, 
                data: Object.keys(data),
                error: error.message 
            });
            throw error;
        }
    }
    
    async renderToElement(templateName, data, targetElement) {
        const html = this.render(templateName, data);
        targetElement.innerHTML = html;
    }
}
```

##### **Task 1.3: Extrair Templates**
```html
<!-- 📁 src/templates/app-layout.hbs -->
<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
    <div class="max-w-4xl mx-auto px-3 py-4">
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-orange-500 text-white grid place-items-center font-bold text-lg">
                    <span>{{restaurant.logo}}</span>
                </div>
                <div>
                    <div class="font-semibold text-lg">{{restaurant.name}}</div>
                    <div class="text-sm text-gray-500">Cardápio digital</div>
                </div>
            </div>
            
            <button id="searchToggle" class="p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
                {{> icons/search}}
            </button>
        </div>
        
        {{#if showSearchBar}}
        <div id="searchBar">
            <input 
                type="text" 
                id="searchInput"
                placeholder="Buscar produtos..." 
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-base"
            >
        </div>
        {{/if}}
    </div>
</header>

<section id="banner" class="max-w-4xl mx-auto px-3 pt-2">
    <div class="rounded-2xl overflow-hidden border border-gray-100">
        <img src="{{imageUrl restaurant.banner 1200 400}}" alt="Banner" class="w-full h-48 sm:h-64 md:h-80 object-cover">
    </div>
</section>

{{> navigation/category-menu categories=categories}}

<main class="max-w-4xl mx-auto px-3 py-4">
    {{#if featuredProducts.length}}
    <section id="featuredSection" class="mb-5">
        <h2 class="text-xl font-bold text-gray-800 mb-3">Destaques</h2>
        <div class="featured-grid gap-2">
            {{#each featuredProducts}}
                {{> product/card this}}
            {{/each}}
        </div>
    </section>
    {{/if}}
    
    <section id="allProductsSection">
        <div id="productsGrid" class="products-grid gap-2">
            {{#each categories}}
                {{#if this.products.length}}
                <div class="category-section mb-6">
                    <h3 class="text-lg font-semibold mb-3">{{this.name}}</h3>
                    <div class="grid gap-2">
                        {{#each this.products}}
                            {{> product/card this}}
                        {{/each}}
                    </div>
                </div>
                {{/if}}
            {{/each}}
        </div>
        
        {{#unless hasProducts}}
        <div class="text-center py-12">
            {{> icons/empty-state}}
            <p class="text-gray-500 text-base">Nenhum produto encontrado</p>
        </div>
        {{/unless}}
    </section>
</main>

<footer class="max-w-4xl mx-auto px-4 pb-8 pt-4 text-center text-xs text-gray-500 border-t border-gray-100">
    <span>{{restaurant.name}} - Cardápio Digital</span>
</footer>
```

```html
<!-- 📁 src/templates/partials/product/card.hbs -->
<div class="product-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200" 
     data-product-id="{{id}}">
    
    {{#if image}}
    <div class="aspect-w-16 aspect-h-9">
        <img src="{{imageUrl image 400 300}}" 
             alt="{{name}}" 
             class="w-full h-full object-cover"
             loading="lazy">
    </div>
    {{/if}}
    
    <div class="p-4">
        <div class="flex items-start justify-between mb-2">
            <h3 class="font-medium text-gray-900 line-clamp-2">{{name}}</h3>
            
            {{#if featured}}
            <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⭐ Destaque
            </span>
            {{/if}}
        </div>
        
        {{#if description}}
        <p class="text-sm text-gray-600 mb-3 line-clamp-3">{{description}}</p>
        {{/if}}
        
        <div class="flex items-center justify-between">
            <div class="price-container">
                {{#if isOnSale}}
                <div class="flex items-center gap-2">
                    <span class="text-lg font-bold text-green-600">{{formatPrice price}}</span>
                    <span class="text-sm text-gray-500 line-through">{{formatPrice originalPrice}}</span>
                </div>
                {{else}}
                <span class="text-lg font-bold text-gray-900">{{formatPrice price}}</span>
                {{/if}}
            </div>
            
            {{#if tags.length}}
            <div class="flex gap-1">
                {{#each tags}}
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{this}}
                </span>
                {{/each}}
            </div>
            {{/if}}
        </div>
    </div>
</div>
```

##### **✅ Critério de Aceite:**
- [ ] 100% HTML inline removido
- [ ] Template engine configurado
- [ ] Partials reutilizáveis criados
- [ ] Helpers customizados funcionando

---

#### **DAY 3-4: Component System**

##### **Task 3.1: Criar Base Component**
```javascript
// 📁 src/js/core/component.js
class Component {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.options = { ...this.defaultOptions, ...options };
        this.eventManager = new EventManager();
        this.state = {};
        this.isDestroyed = false;
        
        this.init();
    }
    
    get defaultOptions() {
        return {};
    }
    
    init() {
        this.render();
        this.bindEvents();
        this.onMount();
    }
    
    render() {
        // Override in subclasses
    }
    
    bindEvents() {
        // Override in subclasses
    }
    
    onMount() {
        // Override in subclasses
    }
    
    setState(newState, shouldRerender = true) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        if (shouldRerender) {
            this.onStateChange(prevState, this.state);
        }
    }
    
    onStateChange(prevState, newState) {
        // Override in subclasses for reactive updates
        this.render();
    }
    
    $(selector) {
        return this.element.querySelector(selector);
    }
    
    $$(selector) {
        return this.element.querySelectorAll(selector);
    }
    
    addEventListener(target, event, handler, options = {}) {
        this.eventManager.addEventListener(target, event, handler, options);
    }
    
    emit(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        
        this.element.dispatchEvent(event);
    }
    
    destroy() {
        if (this.isDestroyed) return;
        
        this.onDestroy();
        this.eventManager.destroy();
        this.isDestroyed = true;
        
        logger.debug('Component destroyed', { 
            component: this.constructor.name,
            element: this.element.tagName 
        });
    }
    
    onDestroy() {
        // Override in subclasses
    }
}
```

##### **Task 3.2: Refatorar Views como Components**
```javascript
// 📁 src/js/components/search-component.js
class SearchComponent extends Component {
    get defaultOptions() {
        return {
            placeholder: 'Buscar produtos...',
            debounceMs: 300,
            minLength: 2
        };
    }
    
    render() {
        this.element.innerHTML = `
            <div class="search-container">
                <input 
                    type="text" 
                    class="search-input w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-base"
                    placeholder="${this.options.placeholder}"
                >
                <div class="search-results hidden"></div>
            </div>
        `;
    }
    
    bindEvents() {
        const input = this.$('.search-input');
        
        this.addEventListener(input, 'input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, this.options.debounceMs));
        
        this.addEventListener(input, 'focus', () => {
            this.setState({ isOpen: true });
        });
        
        this.addEventListener(document, 'click', (e) => {
            if (!this.element.contains(e.target)) {
                this.setState({ isOpen: false });
            }
        });
    }
    
    handleSearch(query) {
        if (query.length < this.options.minLength) {
            this.setState({ results: [], isOpen: false });
            return;
        }
        
        this.setState({ isLoading: true });
        
        this.emit('search', { query });
    }
    
    setResults(results) {
        this.setState({ 
            results, 
            isLoading: false, 
            isOpen: results.length > 0 
        });
    }
    
    onStateChange(prevState, newState) {
        this.updateResultsDisplay();
    }
    
    updateResultsDisplay() {
        const resultsContainer = this.$('.search-results');
        
        if (!this.state.isOpen || !this.state.results?.length) {
            resultsContainer.classList.add('hidden');
            return;
        }
        
        resultsContainer.classList.remove('hidden');
        resultsContainer.innerHTML = this.state.results
            .map(result => `<div class="search-result-item">${result.name}</div>`)
            .join('');
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
```

##### **Task 3.3: Component Registry & Factory**
```javascript
// 📁 src/js/core/component-registry.js
class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.instances = new WeakMap();
    }
    
    register(name, ComponentClass) {
        this.components.set(name, ComponentClass);
        logger.debug('Component registered', { name, class: ComponentClass.name });
    }
    
    create(name, element, options = {}) {
        const ComponentClass = this.components.get(name);
        if (!ComponentClass) {
            throw new Error(`Component ${name} not registered`);
        }
        
        const instance = new ComponentClass(element, options);
        this.instances.set(element, instance);
        
        return instance;
    }
    
    get(element) {
        return this.instances.get(element);
    }
    
    destroy(element) {
        const instance = this.instances.get(element);
        if (instance) {
            instance.destroy();
            this.instances.delete(element);
        }
    }
    
    autoInit(container = document) {
        const elements = container.querySelectorAll('[data-component]');
        
        elements.forEach(element => {
            const componentName = element.dataset.component;
            const options = element.dataset.componentOptions ? 
                JSON.parse(element.dataset.componentOptions) : {};
            
            try {
                this.create(componentName, element, options);
            } catch (error) {
                logger.error('Failed to auto-init component', {
                    component: componentName,
                    element: element.tagName,
                    error: error.message
                });
            }
        });
    }
}

// Global registry
export const componentRegistry = new ComponentRegistry();

// Register default components
componentRegistry.register('search', SearchComponent);
componentRegistry.register('product-grid', ProductGridComponent);
componentRegistry.register('category-menu', CategoryMenuComponent);
```

##### **✅ Critério de Aceite:**
- [ ] Base Component class implementada
- [ ] Views refatoradas como components
- [ ] Component registry funcionando
- [ ] Auto-initialization via data attributes

---

### **⚡ SEMANA 2: PERFORMANCE OPTIMIZATION**

#### **DAY 6-7: Lazy Loading & Code Splitting**

##### **Task 6.1: Implementar Lazy Loading de Imagens**
```javascript
// 📁 src/js/core/lazy-loader.js
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.options
        );
        
        this.imageCache = new Map();
    }
    
    observe(element) {
        this.observer.observe(element);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }
    
    async loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        try {
            // Show loading placeholder
            img.classList.add('loading');
            
            // Check cache first
            if (this.imageCache.has(src)) {
                this.setImageSrc(img, src);
                return;
            }
            
            // Preload image
            const image = new Image();
            
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
                image.src = src;
            });
            
            // Cache the image
            this.imageCache.set(src, image);
            
            // Set the source
            this.setImageSrc(img, src);
            
        } catch (error) {
            logger.warn('Failed to load image', { src, error: error.message });
            this.setImageError(img);
        }
    }
    
    setImageSrc(img, src) {
        img.src = src;
        img.classList.remove('loading');
        img.classList.add('loaded');
        
        // Trigger fade-in animation
        img.style.opacity = '0';
        img.offsetHeight; // Force reflow
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '1';
    }
    
    setImageError(img) {
        img.classList.remove('loading');
        img.classList.add('error');
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz4='; // Placeholder
    }
    
    autoInit(container = document) {
        const lazyImages = container.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.observe(img));
    }
    
    destroy() {
        this.observer.disconnect();
        this.imageCache.clear();
    }
}
```

##### **Task 6.2: Implementar Module Lazy Loading**
```javascript
// 📁 src/js/core/module-loader.js
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }
    
    async loadModule(modulePath) {
        // Return cached module if already loaded
        if (this.loadedModules.has(modulePath)) {
            return this.loadedModules.get(modulePath);
        }
        
        // Return existing promise if currently loading
        if (this.loadingPromises.has(modulePath)) {
            return this.loadingPromises.get(modulePath);
        }
        
        // Start loading
        const loadPromise = this.importModule(modulePath);
        this.loadingPromises.set(modulePath, loadPromise);
        
        try {
            const module = await loadPromise;
            this.loadedModules.set(modulePath, module);
            this.loadingPromises.delete(modulePath);
            
            logger.debug('Module loaded', { modulePath });
            return module;
        } catch (error) {
            this.loadingPromises.delete(modulePath);
            logger.error('Module load failed', { modulePath, error: error.message });
            throw error;
        }
    }
    
    async importModule(modulePath) {
        return import(modulePath);
    }
    
    async loadComponent(componentName) {
        const componentPath = `./components/${componentName}-component.js`;
        const module = await this.loadModule(componentPath);
        
        // Auto-register component
        const ComponentClass = module.default || module[componentName];
        if (ComponentClass) {
            componentRegistry.register(componentName, ComponentClass);
        }
        
        return ComponentClass;
    }
    
    preloadModules(modulePaths) {
        return Promise.allSettled(
            modulePaths.map(path => this.loadModule(path))
        );
    }
}

// Global loader
export const moduleLoader = new ModuleLoader();
```

##### **Task 6.3: Otimizar Bundle com Vite**
```javascript
// 📁 vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['handlebars'],
                    admin: ['./src/js/admin.js'],
                    components: [
                        './src/js/components/search-component.js',
                        './src/js/components/product-grid-component.js'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
        include: ['handlebars']
    }
});
```

##### **✅ Critério de Aceite:**
- [ ] Lazy loading de imagens implementado
- [ ] Code splitting por rotas/features
- [ ] Bundle size <500KB inicial
- [ ] Modules carregados on-demand

---

#### **DAY 8-9: Caching & Memoization**

##### **Task 8.1: Implementar Memory Cache**
```javascript
// 📁 src/js/core/cache-manager.js
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            sets: 0
        };
    }
    
    set(key, value, ttlMs = 300000) { // 5 minutes default
        const expiresAt = Date.now() + ttlMs;
        
        this.memoryCache.set(key, {
            value,
            expiresAt,
            createdAt: Date.now()
        });
        
        this.cacheStats.sets++;
        
        // Schedule cleanup
        setTimeout(() => {
            this.delete(key);
        }, ttlMs);
    }
    
    get(key) {
        const item = this.memoryCache.get(key);
        
        if (!item) {
            this.cacheStats.misses++;
            return null;
        }
        
        if (Date.now() > item.expiresAt) {
            this.delete(key);
            this.cacheStats.misses++;
            return null;
        }
        
        this.cacheStats.hits++;
        return item.value;
    }
    
    delete(key) {
        return this.memoryCache.delete(key);
    }
    
    clear() {
        this.memoryCache.clear();
        this.cacheStats = { hits: 0, misses: 0, sets: 0 };
    }
    
    getStats() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        return {
            ...this.cacheStats,
            hitRate: total > 0 ? (this.cacheStats.hits / total) * 100 : 0,
            size: this.memoryCache.size
        };
    }
    
    // Memoization decorator
    memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
        return (...args) => {
            const key = `memoize:${func.name}:${keyGenerator(...args)}`;
            
            let result = this.get(key);
            if (result === null) {
                result = func(...args);
                this.set(key, result);
            }
            
            return result;
        };
    }
}

// Global cache
export const cacheManager = new CacheManager();
```

##### **Task 8.2: Aplicar Memoization em Operações Caras**
```javascript
// 📁 src/js/database.js (refatorado)
class Database {
    constructor() {
        // Memoizar operações de leitura
        this.getProducts = cacheManager.memoize(
            this._getProducts.bind(this),
            (filters = {}) => `products:${JSON.stringify(filters)}`
        );
        
        this.getCategories = cacheManager.memoize(
            this._getCategories.bind(this),
            (activeOnly) => `categories:${activeOnly}`
        );
    }
    
    // Original methods renamed with underscore
    _getProducts(filters = {}) {
        // Original implementation
    }
    
    _getCategories(activeOnly = false) {
        // Original implementation
    }
    
    // Invalidar cache quando dados mudam
    addProduct(product) {
        const result = this._addProduct(product);
        this.invalidateProductCache();
        return result;
    }
    
    updateProduct(id, updates) {
        const result = this._updateProduct(id, updates);
        this.invalidateProductCache();
        return result;
    }
    
    invalidateProductCache() {
        // Remove all cached products
        Array.from(cacheManager.memoryCache.keys())
            .filter(key => key.includes('products:'))
            .forEach(key => cacheManager.delete(key));
    }
}
```

##### **Task 8.3: Service Worker para Cache de Assets**
```javascript
// 📁 public/sw.js
const CACHE_NAME = 'menu-online-v1';
const STATIC_ASSETS = [
    '/',
    '/admin.html',
    '/src/js/app.js',
    '/src/styles/main.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    // Cache-first strategy for static assets
    if (event.request.url.includes('/src/') || event.request.url.includes('/images/')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
    
    // Network-first for API calls
    if (event.request.url.includes('supabase.co')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});
```

##### **✅ Critério de Aceite:**
- [ ] Memory cache implementado
- [ ] Memoization em operações DB
- [ ] Service Worker para assets
- [ ] Cache hit rate >80%

---

#### **DAY 10: Bundle Analysis & Optimization**

##### **Task 10.1: Bundle Analysis Setup**
```bash
npm install --save-dev vite-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// 📁 scripts/analyze-bundle.js
import { defineConfig } from 'vite';
import { BundleAnalyzerPlugin } from 'vite-bundle-analyzer';

export default defineConfig({
    plugins: [
        BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
            generateStatsFile: true
        })
    ]
});
```

##### **Task 10.2: Tree Shaking Optimization**
```javascript
// 📁 src/js/utils/index.js - Usar named exports
export { formatPrice } from './price-formatter.js';
export { debounce } from './debounce.js';
export { throttle } from './throttle.js';

// ❌ Evitar:
// export default { formatPrice, debounce, throttle };

// ✅ Import apenas o necessário:
import { formatPrice } from './utils/index.js';
```

##### **Task 10.3: Performance Monitoring**
```javascript
// 📁 src/js/core/performance-monitor.js
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.setupObservers();
    }
    
    setupObservers() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordMetric(entry.name, entry.startTime);
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });
        }
        
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.recordMetric('largest-contentful-paint', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
    
    mark(name) {
        performance.mark(name);
    }
    
    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.recordMetric(name, measure.duration);
    }
    
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        this.metrics.get(name).push({
            value,
            timestamp: Date.now()
        });
        
        logger.debug('Performance metric recorded', { name, value });
    }
    
    getMetrics() {
        const summary = {};
        
        this.metrics.forEach((values, name) => {
            const nums = values.map(v => v.value);
            summary[name] = {
                count: nums.length,
                avg: nums.reduce((a, b) => a + b, 0) / nums.length,
                min: Math.min(...nums),
                max: Math.max(...nums),
                latest: nums[nums.length - 1]
            };
        });
        
        return summary;
    }
    
    trackOperation(name, operation) {
        this.mark(`${name}-start`);
        
        const result = operation();
        
        if (result instanceof Promise) {
            return result.finally(() => {
                this.mark(`${name}-end`);
                this.measure(name, `${name}-start`, `${name}-end`);
            });
        } else {
            this.mark(`${name}-end`);
            this.measure(name, `${name}-start`, `${name}-end`);
            return result;
        }
    }
}

// Global monitor
export const performanceMonitor = new PerformanceMonitor();
```

##### **✅ Critério de Aceite:**
- [ ] Bundle size analysis configurado
- [ ] Tree shaking otimizado
- [ ] Performance monitoring ativo
- [ ] Core Web Vitals <2.5s LCP, <100ms FID

---

## 🧪 TESTES DE PERFORMANCE

### **Performance Tests**
```javascript
// 📁 tests/performance/load-time.test.js
describe('Performance', () => {
    test('should load initial page in under 2 seconds', async () => {
        const start = performance.now();
        
        await page.goto('http://localhost:3000');
        await page.waitForSelector('[data-testid="products-grid"]');
        
        const end = performance.now();
        const loadTime = end - start;
        
        expect(loadTime).toBeLessThan(2000);
    });
    
    test('should have efficient product filtering', () => {
        const products = generateTestProducts(1000);
        
        const start = performance.now();
        const filtered = productController.filterProducts(products, 'pizza');
        const end = performance.now();
        
        expect(end - start).toBeLessThan(10); // 10ms max
        expect(filtered.length).toBeGreaterThan(0);
    });
});
```

### **Memory Leak Tests**
```javascript
// 📁 tests/performance/memory-leaks.test.js
describe('Memory Management', () => {
    test('should not leak memory on repeated navigation', async () => {
        const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
        
        // Navigate 100 times
        for (let i = 0; i < 100; i++) {
            await page.goto('http://localhost:3000');
            await page.goto('http://localhost:3000/admin');
        }
        
        await page.evaluate(() => {
            // Force garbage collection
            if (window.gc) window.gc();
        });
        
        const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
        
        // Memory should not increase by more than 50%
        expect(finalMemory).toBeLessThan(initialMemory * 1.5);
    });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### **Performance KPIs:**
- [ ] **First Contentful Paint:** <1.5s
- [ ] **Time to Interactive:** <2.5s
- [ ] **Bundle Size:** <500KB initial
- [ ] **Cache Hit Rate:** >80%
- [ ] **Memory Usage:** <50MB

### **Code Quality KPIs:**
- [ ] **Cyclomatic Complexity:** <10 per function
- [ ] **Maintainability Index:** >80
- [ ] **Code Duplication:** <5%
- [ ] **Test Coverage:** >80%

---

## 🚀 ENTREGÁVEIS FINAIS

### **Código:**
- [ ] `src/js/core/` - Arquitetura core modules
- [ ] `src/templates/` - Handlebars templates
- [ ] `src/js/components/` - Reusable components
- [ ] Performance optimizations

### **Ferramentas:**
- [ ] Bundle analyzer configurado
- [ ] Performance monitoring
- [ ] Automated performance tests

---

**🎯 PRÓXIMO PASSO:** Finalizar e iniciar **FASE 4: TESTES & QA**

**⚠️ BLOQUEADORES:** Performance baselines necessários para próxima fase