# 🛡️ FASE 2: ERROR HANDLING & ROBUSTEZ

## 🎯 OBJETIVO
Transformar o sistema de **"pode quebrar"** para **"nunca quebra"** - padrão NASA onde falhas são inaceitáveis.

**⏰ DURAÇÃO:** 1 semana (5 dias úteis)  
**🎯 PRIORIDADE:** 🟡 **ALTA** - Afeta experiência do usuário

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### **1. Operações Async sem Try-Catch**
```javascript
// ❌ PROBLEMÁTICO ATUAL:
async initSupabase() {
    const { createClient } = await import('...');  // Pode falhar
    this.supabase = createClient(url, key);        // Pode falhar
    await this.syncLocalToSupabase();             // Pode falhar
}

// ✅ CORREÇÃO:
async initSupabase() {
    try {
        const { createClient } = await import('...');
        this.supabase = createClient(url, key);
        await this.syncLocalToSupabase();
    } catch (error) {
        this.errorHandler.handle(error, 'SUPABASE_INIT_FAILED');
        this.fallbackToLocalStorage();
    }
}
```

### **2. Falhas Silenciosas**
```javascript
// ❌ PROBLEMÁTICO ATUAL:
catch (error) {
    console.error('Erro:', error);  // User não sabe que deu erro
    this.initLocalStorage();        // Silent fallback
}

// ✅ CORREÇÃO:
catch (error) {
    this.logger.error('Supabase init failed', { error, context: 'init' });
    this.notificationService.showError('Conectando em modo offline...');
    this.fallbackToLocalStorage();
}
```

### **3. Memory Leaks de Event Listeners**
```javascript
// ❌ PROBLEMÁTICO ATUAL:
setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handler);
    // Nunca removido = memory leak
}

// ✅ CORREÇÃO:
class App {
    constructor() {
        this.eventListeners = [];
    }
    
    destroy() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
    }
}
```

---

## 📋 CHECKLIST DETALHADO

### **🔧 DAY 1: Sistema de Error Handling Global**

#### **Task 1.1: Criar Error Handler Central**
```javascript
// 📁 src/js/core/error-handler.js
class ErrorHandler {
    constructor(logger, notificationService) {
        this.logger = logger;
        this.notifications = notificationService;
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Capturar erros JavaScript não tratados
        window.addEventListener('error', (event) => {
            this.handle(event.error, 'UNCAUGHT_ERROR', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Capturar promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handle(event.reason, 'UNHANDLED_PROMISE_REJECTION');
            event.preventDefault(); // Prevent console error
        });
    }
    
    handle(error, code, context = {}) {
        const errorInfo = {
            code,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            context
        };
        
        // Log estruturado
        this.logger.error('Application error', errorInfo);
        
        // Notificar usuário de forma amigável
        const userMessage = this.getUserFriendlyMessage(code);
        this.notifications.showError(userMessage);
        
        // Se crítico, tentar recovery
        if (this.isCritical(code)) {
            this.attemptRecovery(code, error);
        }
    }
    
    getUserFriendlyMessage(code) {
        const messages = {
            'SUPABASE_INIT_FAILED': 'Conectando em modo offline...',
            'NETWORK_ERROR': 'Problema de conexão. Tentando novamente...',
            'VALIDATION_ERROR': 'Dados inválidos. Verifique os campos.',
            'AUTH_FAILED': 'Falha na autenticação. Tente fazer login novamente.',
            'DEFAULT': 'Algo deu errado. Nossa equipe foi notificada.'
        };
        
        return messages[code] || messages.DEFAULT;
    }
    
    isCritical(code) {
        const criticalCodes = ['AUTH_FAILED', 'DATABASE_CONNECTION_LOST'];
        return criticalCodes.includes(code);
    }
    
    attemptRecovery(code, error) {
        switch (code) {
            case 'AUTH_FAILED':
                this.authService.logout();
                window.location.href = '/login';
                break;
            case 'DATABASE_CONNECTION_LOST':
                this.databaseService.fallbackToLocalStorage();
                break;
        }
    }
}
```

#### **Task 1.2: Criar Notification Service**
```javascript
// 📁 src/js/core/notification-service.js
class NotificationService {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container fixed top-4 right-4 z-50';
        document.body.appendChild(container);
        return container;
    }
    
    showError(message, duration = 5000) {
        this.show(message, 'error', duration);
    }
    
    showSuccess(message, duration = 3000) {
        this.show(message, 'success', duration);
    }
    
    showWarning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }
    
    show(message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} p-4 mb-2 rounded-lg shadow-lg max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="notification-icon mr-3">${this.getIcon(type)}</div>
                <div class="notification-message flex-1">${message}</div>
                <button class="notification-close ml-2" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    getIcon(type) {
        const icons = {
            error: '⚠️',
            success: '✅',
            warning: '⚡',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}
```

#### **✅ Critério de Aceite:**
- [ ] Global error handler captura 100% erros
- [ ] User-friendly notifications implementadas
- [ ] Error recovery strategies definidas

---

### **📝 DAY 2: Logging Estruturado**

#### **Task 2.1: Implementar Winston Logger**
```bash
npm install winston
npm install winston-transport-sentry-node  # Se usar Sentry
```

```javascript
// 📁 src/js/core/logger.js
import winston from 'winston';

class Logger {
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: {
                service: 'menu-online',
                version: process.env.npm_package_version,
                environment: process.env.NODE_ENV
            },
            transports: [
                // Console para desenvolvimento
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                
                // File para produção
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log'
                })
            ]
        });
    }
    
    debug(message, meta = {}) {
        this.logger.debug(message, { ...meta, userId: this.getCurrentUserId() });
    }
    
    info(message, meta = {}) {
        this.logger.info(message, { ...meta, userId: this.getCurrentUserId() });
    }
    
    warn(message, meta = {}) {
        this.logger.warn(message, { ...meta, userId: this.getCurrentUserId() });
    }
    
    error(message, meta = {}) {
        this.logger.error(message, { 
            ...meta, 
            userId: this.getCurrentUserId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
    
    getCurrentUserId() {
        // Implementar baseado no seu sistema de auth
        return sessionStorage.getItem('userId') || 'anonymous';
    }
}

// Singleton instance
export const logger = new Logger();
```

#### **Task 2.2: Instrumentar Código com Logs**
```javascript
// Exemplo de uso correto em controllers
class ProductController {
    async loadProducts() {
        logger.info('Loading products started', { 
            searchQuery: this.searchQuery,
            category: this.currentCategory 
        });
        
        try {
            const products = await this.database.getProducts(filters);
            
            logger.info('Products loaded successfully', { 
                count: products.length,
                filters 
            });
            
            this.view.renderProducts(products);
        } catch (error) {
            logger.error('Failed to load products', { 
                error: error.message,
                stack: error.stack,
                filters 
            });
            
            this.errorHandler.handle(error, 'PRODUCTS_LOAD_FAILED');
        }
    }
}
```

#### **✅ Critério de Aceite:**
- [ ] Winston logger configurado
- [ ] Logs estruturados em JSON
- [ ] Context information em todos logs
- [ ] Log levels apropriados (debug, info, warn, error)

---

### **🔄 DAY 3: Retry Mechanisms & Fallbacks**

#### **Task 3.1: Implementar Retry Logic**
```javascript
// 📁 src/js/core/retry-handler.js
class RetryHandler {
    static async withRetry(
        operation, 
        maxAttempts = 3, 
        delayMs = 1000,
        backoffMultiplier = 2
    ) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                logger.warn(`Operation failed, attempt ${attempt}/${maxAttempts}`, {
                    error: error.message,
                    attempt,
                    operation: operation.name
                });
                
                if (attempt === maxAttempts) {
                    throw lastError;
                }
                
                // Exponential backoff
                const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }
    
    static async withTimeout(operation, timeoutMs = 5000) {
        return Promise.race([
            operation(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
            )
        ]);
    }
    
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

#### **Task 3.2: Aplicar Retry em Operações Críticas**
```javascript
// Exemplo no Supabase client
class SupabaseDatabase {
    async getProducts(filters) {
        return RetryHandler.withRetry(async () => {
            return RetryHandler.withTimeout(async () => {
                const response = await this.supabase
                    .from('products')
                    .select('*')
                    .eq('restaurant_id', this.currentRestaurant.id);
                
                if (response.error) {
                    throw new Error(`Supabase error: ${response.error.message}`);
                }
                
                return response.data;
            }, 5000); // 5s timeout
        }, 3); // 3 retry attempts
    }
}
```

#### **✅ Critério de Aceite:**
- [ ] Retry logic em operações de rede
- [ ] Exponential backoff implementado
- [ ] Timeout protection em todas async operations
- [ ] Graceful degradation quando falha

---

### **🧹 DAY 4: Memory Management & Cleanup**

#### **Task 4.1: Event Listener Management**
```javascript
// 📁 src/js/core/event-manager.js
class EventManager {
    constructor() {
        this.listeners = [];
        this.observers = [];
    }
    
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        this.listeners.push({
            element,
            event,
            handler,
            options
        });
    }
    
    addResizeObserver(target, callback) {
        const observer = new ResizeObserver(callback);
        observer.observe(target);
        
        this.observers.push({ observer, target, callback });
    }
    
    addIntersectionObserver(target, callback, options = {}) {
        const observer = new IntersectionObserver(callback, options);
        observer.observe(target);
        
        this.observers.push({ observer, target, callback });
    }
    
    destroy() {
        // Remove all event listeners
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        
        // Disconnect all observers
        this.observers.forEach(({ observer }) => {
            observer.disconnect();
        });
        
        // Clear arrays
        this.listeners = [];
        this.observers = [];
    }
}
```

#### **Task 4.2: Component Lifecycle Management**
```javascript
// Refatorar App.js para ter lifecycle
class App {
    constructor() {
        this.eventManager = new EventManager();
        this.components = [];
        this.init();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
    }
    
    setupEventListeners() {
        // Usar EventManager ao invés de addEventListener direto
        this.eventManager.addEventListener(
            document.getElementById('searchToggle'),
            'click',
            () => this.toggleSearch()
        );
        
        this.eventManager.addEventListener(
            document.getElementById('searchInput'),
            'input',
            this.debounce((e) => this.handleSearch(e), 300)
        );
    }
    
    destroy() {
        logger.info('App destroying, cleaning up resources');
        
        // Cleanup event manager
        this.eventManager.destroy();
        
        // Cleanup components
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        
        // Clear intervals/timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
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

#### **✅ Critério de Aceite:**
- [ ] Zero memory leaks (test com DevTools)
- [ ] Event listeners sempre removidos
- [ ] Observers desconectados no cleanup
- [ ] Lifecycle management em todos components

---

### **🔧 DAY 5: Circuit Breaker & Health Checks**

#### **Task 5.1: Implementar Circuit Breaker**
```javascript
// 📁 src/js/core/circuit-breaker.js
class CircuitBreaker {
    constructor(name, options = {}) {
        this.name = name;
        this.failureThreshold = options.failureThreshold || 5;
        this.timeout = options.timeout || 60000; // 1 minute
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.nextAttempt = Date.now();
    }
    
    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker ${this.name} is OPEN`);
            }
            
            this.state = 'HALF_OPEN';
        }
        
        try {
            const result = await this.callOperation(operation);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    async callOperation(operation) {
        return Promise.race([
            operation(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operation timeout')), this.timeout)
            )
        ]);
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
        logger.info(`Circuit breaker ${this.name} reset to CLOSED`);
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            
            logger.error(`Circuit breaker ${this.name} tripped to OPEN`, {
                failureCount: this.failureCount,
                threshold: this.failureThreshold
            });
        }
    }
}
```

#### **Task 5.2: Health Check System**
```javascript
// 📁 src/js/core/health-check.js
class HealthCheck {
    constructor() {
        this.checks = new Map();
        this.interval = 30000; // 30 seconds
        this.isRunning = false;
    }
    
    register(name, checkFunction, options = {}) {
        this.checks.set(name, {
            check: checkFunction,
            critical: options.critical || false,
            timeout: options.timeout || 5000
        });
    }
    
    async runCheck(name) {
        const checkConfig = this.checks.get(name);
        if (!checkConfig) {
            throw new Error(`Health check ${name} not found`);
        }
        
        try {
            const result = await Promise.race([
                checkConfig.check(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Health check timeout')), checkConfig.timeout)
                )
            ]);
            
            return {
                name,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                data: result
            };
        } catch (error) {
            return {
                name,
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
    
    async runAllChecks() {
        const results = [];
        
        for (const [name] of this.checks) {
            const result = await this.runCheck(name);
            results.push(result);
        }
        
        const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
        
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks: results
        };
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        const runChecks = async () => {
            if (!this.isRunning) return;
            
            try {
                const health = await this.runAllChecks();
                logger.info('Health check completed', health);
                
                // Se unhealthy, alertar
                if (health.status === 'unhealthy') {
                    this.alertUnhealthySystem(health);
                }
            } catch (error) {
                logger.error('Health check failed', { error: error.message });
            }
            
            setTimeout(runChecks, this.interval);
        };
        
        runChecks();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    alertUnhealthySystem(health) {
        // Implementar alertas (email, webhook, etc.)
        logger.error('System is unhealthy', health);
    }
}
```

#### **Task 5.3: Integrar Health Checks**
```javascript
// Em app.js
const healthCheck = new HealthCheck();

// Registrar checks
healthCheck.register('database', async () => {
    const testQuery = await database.getCategories();
    return { connected: true, categories: testQuery.length };
});

healthCheck.register('supabase', async () => {
    if (supabaseDatabase.isOnline) {
        const ping = await supabaseDatabase.supabase.from('restaurants').select('count');
        return { connected: true, response_time: Date.now() };
    }
    throw new Error('Supabase offline');
});

// Iniciar health checks
healthCheck.start();
```

#### **✅ Critério de Aceite:**
- [ ] Circuit breaker implementado
- [ ] Health checks em serviços críticos
- [ ] Monitoring automático ativo
- [ ] Alertas quando sistema unhealthy

---

## 🧪 TESTES DE ROBUSTEZ

### **Error Simulation Tests**
```javascript
// 📁 tests/error-handling/error-scenarios.test.js
describe('Error Handling', () => {
    test('should handle network failures gracefully', async () => {
        // Simulate network failure
        jest.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'));
        
        const result = await productController.loadProducts();
        
        expect(notificationService.showError).toHaveBeenCalledWith(
            'Problema de conexão. Tentando novamente...'
        );
        expect(result).toEqual([]); // Fallback to empty array
    });
    
    test('should retry failed operations', async () => {
        let attempts = 0;
        const operation = jest.fn().mockImplementation(() => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Temporary failure');
            }
            return 'success';
        });
        
        const result = await RetryHandler.withRetry(operation);
        
        expect(attempts).toBe(3);
        expect(result).toBe('success');
    });
});
```

### **Memory Leak Tests**
```javascript
// 📁 tests/performance/memory-leaks.test.js
describe('Memory Management', () => {
    test('should cleanup event listeners on destroy', () => {
        const app = new App();
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        
        app.destroy();
        
        expect(removeEventListenerSpy).toHaveBeenCalled();
    });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

### **Error Rate Metrics:**
- [ ] **Unhandled Errors:** 0
- [ ] **Error Recovery Rate:** 95%+
- [ ] **User-Friendly Error Messages:** 100%
- [ ] **Memory Leaks:** 0

### **Performance Metrics:**
- [ ] **Error Handling Overhead:** <10ms
- [ ] **Retry Success Rate:** 80%+
- [ ] **Circuit Breaker Response:** <1s

---

## 🚀 ENTREGÁVEIS FINAIS

### **Código:**
- [ ] `src/js/core/` - Error handling core modules
- [ ] Refatoração com try-catch em 100% async operations
- [ ] Tests de error scenarios (>80% coverage)

### **Documentação:**
- [ ] Error handling guidelines
- [ ] Runbook para troubleshooting
- [ ] Health check dashboard

---

**🎯 PRÓXIMO PASSO:** Finalizar e iniciar **FASE 3: ARQUITETURA & PERFORMANCE**

**⚠️ BLOQUEADORES:** Logs estruturados são pré-requisito para monitoring