# 🧪 FASE 4: TESTES & QA

## 🎯 OBJETIVO
Implementar **cobertura de testes de 80%+** e pipeline CI/CD robusto - padrão usado por Google, Facebook, Netflix.

**⏰ DURAÇÃO:** 2 semanas (10 dias úteis)  
**🎯 PRIORIDADE:** 🟢 **MÉDIA** - Qualidade a longo prazo

---

## 🚨 GAPS DE QUALIDADE IDENTIFICADOS

### **1. Zero Testes Atualmente**
```javascript
// ❌ SITUAÇÃO ATUAL:
// - 0 unit tests
// - 0 integration tests  
// - 0 E2E tests
// - 0 visual regression tests
// - Deploy manual sem validação

// ✅ META:
// - 80%+ unit test coverage
// - Integration tests em features críticas
// - E2E tests em user journeys principais
// - Visual regression em components
// - CI/CD com quality gates
```

### **2. Falta de Pipeline CI/CD**
```yaml
# ❌ ATUAL: Deploy manual
git push
# Reze para não quebrar produção 🙏

# ✅ META: Pipeline automatizado
git push → tests → security scan → build → deploy
```

### **3. Sem Quality Gates**
```javascript
// ❌ ATUAL: Código vai direto para produção
function addProduct(product) {
    // Sem validação, sem testes
    products.push(product);
}

// ✅ META: Quality gates impedem deploy
❌ Tests failing → Block deploy
❌ Coverage <80% → Block deploy  
❌ Security issues → Block deploy
❌ Performance regression → Block deploy
```

---

## 📋 CHECKLIST DETALHADO

### **🔧 SEMANA 1: SETUP DE TESTES**

#### **DAY 1-2: Jest Setup & Unit Tests**

##### **Task 1.1: Configurar Jest**
```bash
npm install --save-dev jest @types/jest
npm install --save-dev jest-environment-jsdom
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/dom
npm install --save-dev jest-coverage-collector
```

```javascript
// 📁 jest.config.js
export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    collectCoverageFrom: [
        'src/js/**/*.js',
        '!src/js/**/*.test.js',
        '!src/js/vendor/**',
        '!**/node_modules/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coverageReporters: ['text', 'html', 'lcov'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.js$': 'babel-jest'
    }
};
```

```javascript
// 📁 tests/setup.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Suppress console.error in tests unless explicitly testing it
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is deprecated')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
```

##### **Task 1.2: Unit Tests para Core Classes**
```javascript
// 📁 tests/unit/database.test.js
import Database from '@/js/database.js';

describe('Database', () => {
    let database;
    
    beforeEach(() => {
        localStorage.clear();
        database = new Database();
    });
    
    afterEach(() => {
        localStorage.clear();
    });
    
    describe('Products', () => {
        test('should add product with valid data', () => {
            const product = {
                name: 'Pizza Margherita',
                description: 'Classic pizza with tomato and mozzarella',
                price: 25.90,
                categoryId: 'cat1'
            };
            
            const result = database.addProduct(product);
            
            expect(result).toMatchObject(product);
            expect(result.id).toBeDefined();
            expect(result.createdAt).toBeDefined();
            expect(result.active).toBe(true);
        });
        
        test('should not add product with invalid data', () => {
            const invalidProduct = {
                name: '', // Empty name
                price: -10 // Negative price
            };
            
            expect(() => {
                database.addProduct(invalidProduct);
            }).toThrow('Invalid product data');
        });
        
        test('should filter products by category', () => {
            const products = [
                { categoryId: 'cat1', name: 'Product 1', active: true },
                { categoryId: 'cat2', name: 'Product 2', active: true },
                { categoryId: 'cat1', name: 'Product 3', active: true }
            ];
            
            database.products = products;
            
            const filtered = database.getProducts({ categoryId: 'cat1' });
            
            expect(filtered).toHaveLength(2);
            expect(filtered.every(p => p.categoryId === 'cat1')).toBe(true);
        });
        
        test('should search products by name', () => {
            const products = [
                { name: 'Pizza Margherita', active: true },
                { name: 'Pizza Pepperoni', active: true },
                { name: 'Burger Classic', active: true }
            ];
            
            database.products = products;
            
            const results = database.getProducts({ search: 'Pizza' });
            
            expect(results).toHaveLength(2);
            expect(results.every(p => p.name.includes('Pizza'))).toBe(true);
        });
    });
    
    describe('Categories', () => {
        test('should add category with auto-increment order', () => {
            const category = {
                name: 'Sobremesas'
            };
            
            const result = database.addCategory(category);
            
            expect(result.name).toBe('Sobremesas');
            expect(result.order).toBeDefined();
            expect(result.active).toBe(true);
        });
        
        test('should reorder categories correctly', () => {
            const categories = [
                { id: 'cat1', name: 'Cat 1', order: 1 },
                { id: 'cat2', name: 'Cat 2', order: 2 },
                { id: 'cat3', name: 'Cat 3', order: 3 }
            ];
            
            database.categories = categories;
            
            database.reorderCategories(['cat3', 'cat1', 'cat2']);
            
            const reordered = database.getCategories();
            expect(reordered[0].id).toBe('cat3');
            expect(reordered[1].id).toBe('cat1');
            expect(reordered[2].id).toBe('cat2');
        });
    });
    
    describe('Authentication', () => {
        test('should authenticate with correct credentials', () => {
            const isAuth = database.authenticate('admin', 'admin123');
            
            expect(isAuth).toBe(true);
            expect(sessionStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true');
        });
        
        test('should reject invalid credentials', () => {
            const isAuth = database.authenticate('admin', 'wrongpassword');
            
            expect(isAuth).toBe(false);
            expect(sessionStorage.setItem).not.toHaveBeenCalled();
        });
        
        test('should check authentication expiry', () => {
            // Mock expired session
            sessionStorage.getItem.mockImplementation((key) => {
                if (key === 'isAuthenticated') return 'true';
                if (key === 'authTime') return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
                return null;
            });
            
            const isAuth = database.isAuthenticated();
            
            expect(isAuth).toBe(false);
        });
    });
});
```

##### **Task 1.3: Tests para Components**
```javascript
// 📁 tests/unit/components/search-component.test.js
import { SearchComponent } from '@/js/components/search-component.js';

describe('SearchComponent', () => {
    let container;
    let component;
    
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        
        component = new SearchComponent(container, {
            placeholder: 'Test search...',
            debounceMs: 100
        });
    });
    
    afterEach(() => {
        component.destroy();
        document.body.removeChild(container);
    });
    
    test('should render search input with correct placeholder', () => {
        const input = container.querySelector('.search-input');
        
        expect(input).toBeInTheDocument();
        expect(input.placeholder).toBe('Test search...');
    });
    
    test('should emit search event after debounce', (done) => {
        const input = container.querySelector('.search-input');
        
        container.addEventListener('search', (event) => {
            expect(event.detail.query).toBe('pizza');
            done();
        });
        
        // Simulate typing
        input.value = 'pizza';
        input.dispatchEvent(new Event('input'));
    });
    
    test('should not search for short queries', (done) => {
        const input = container.querySelector('.search-input');
        let searchFired = false;
        
        container.addEventListener('search', () => {
            searchFired = true;
        });
        
        input.value = 'p'; // Less than minLength
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
            expect(searchFired).toBe(false);
            done();
        }, 200);
    });
    
    test('should display search results', () => {
        const results = [
            { id: 1, name: 'Pizza Margherita' },
            { id: 2, name: 'Pizza Pepperoni' }
        ];
        
        component.setResults(results);
        
        const resultItems = container.querySelectorAll('.search-result-item');
        expect(resultItems).toHaveLength(2);
        expect(resultItems[0].textContent).toContain('Pizza Margherita');
    });
});
```

##### **✅ Critério de Aceite:**
- [ ] Jest configurado com coverage
- [ ] Unit tests para Database class
- [ ] Unit tests para Components
- [ ] Coverage >60% (crescendo para 80%)

---

#### **DAY 3-4: Integration Tests**

##### **Task 3.1: Configurar Testing Library**
```bash
npm install --save-dev @testing-library/user-event
npm install --save-dev msw  # Mock Service Worker
```

##### **Task 3.2: Integration Tests de Features**
```javascript
// 📁 tests/integration/product-management.test.js
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock Supabase API
const server = setupServer(
    rest.get('*/rest/v1/products', (req, res, ctx) => {
        return res(ctx.json([
            { id: 1, name: 'Pizza Margherita', price: 25.90, active: true }
        ]));
    }),
    
    rest.post('*/rest/v1/products', (req, res, ctx) => {
        const product = req.body;
        return res(ctx.json({ ...product, id: Date.now() }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Product Management Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="admin-app"></div>
        `;
    });
    
    test('should complete full product creation flow', async () => {
        const user = userEvent.setup();
        
        // Initialize admin app
        const { AdminApp } = await import('@/js/admin.js');
        new AdminApp();
        
        // Navigate to products section
        await user.click(screen.getByText('Produtos'));
        
        // Open add product modal
        await user.click(screen.getByText('Adicionar Produto'));
        
        // Fill product form
        await user.type(screen.getByLabelText('Nome'), 'Pizza Test');
        await user.type(screen.getByLabelText('Descrição'), 'Pizza for testing');
        await user.type(screen.getByLabelText('Preço'), '29.90');
        
        // Select category
        await user.selectOptions(screen.getByLabelText('Categoria'), 'cat1');
        
        // Submit form
        await user.click(screen.getByText('Salvar'));
        
        // Verify product appears in list
        await waitFor(() => {
            expect(screen.getByText('Pizza Test')).toBeInTheDocument();
        });
        
        // Verify API was called
        expect(server.handlerInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                url: expect.stringContaining('/products')
            })
        );
    });
    
    test('should handle product update workflow', async () => {
        const user = userEvent.setup();
        
        // Initialize with existing product
        new AdminApp();
        
        // Click edit on first product
        await user.click(screen.getAllByText('Editar')[0]);
        
        // Update name
        const nameInput = screen.getByDisplayValue('Pizza Margherita');
        await user.clear(nameInput);
        await user.type(nameInput, 'Pizza Margherita Deluxe');
        
        // Save changes
        await user.click(screen.getByText('Salvar'));
        
        // Verify updated name appears
        await waitFor(() => {
            expect(screen.getByText('Pizza Margherita Deluxe')).toBeInTheDocument();
        });
    });
    
    test('should validate form and show errors', async () => {
        const user = userEvent.setup();
        
        new AdminApp();
        
        await user.click(screen.getByText('Adicionar Produto'));
        
        // Try to submit empty form
        await user.click(screen.getByText('Salvar'));
        
        // Should show validation errors
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
        expect(screen.getByText('Preço deve ser maior que zero')).toBeInTheDocument();
    });
});
```

##### **Task 3.3: Database Integration Tests**
```javascript
// 📁 tests/integration/database-sync.test.js
describe('Database Synchronization', () => {
    test('should sync localStorage to Supabase on connection', async () => {
        // Setup localStorage with data
        const localData = {
            products: [
                { id: 'local1', name: 'Local Product', price: 10.00 }
            ],
            categories: [
                { id: 'local-cat1', name: 'Local Category' }
            ]
        };
        
        localStorage.setItem('restaurantData', JSON.stringify(localData));
        
        // Mock successful Supabase connection
        server.use(
            rest.post('*/rest/v1/products', (req, res, ctx) => {
                return res(ctx.json({ id: 'remote1', ...req.body }));
            })
        );
        
        // Initialize database with Supabase
        const { SupabaseDatabase } = await import('@/js/supabase-client.js');
        const db = new SupabaseDatabase();
        
        await db.configureSupabase('mock-url', 'mock-key');
        
        // Verify sync occurred
        await waitFor(() => {
            expect(db.isOnline).toBe(true);
        });
        
        // Check that data was sent to Supabase
        expect(server.handlerInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                url: expect.stringContaining('/products')
            })
        );
    });
    
    test('should fallback to localStorage when Supabase fails', async () => {
        // Mock Supabase failure
        server.use(
            rest.get('*/rest/v1/*', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );
        
        const db = new SupabaseDatabase();
        await db.configureSupabase('mock-url', 'mock-key');
        
        // Should fallback to localStorage
        expect(db.useLocalStorage).toBe(true);
        
        // Should still be able to add products
        const product = { name: 'Test Product', price: 15.00 };
        const result = db.addProduct(product);
        
        expect(result.id).toBeDefined();
    });
});
```

##### **✅ Critério de Aceite:**
- [ ] Integration tests para user flows
- [ ] API mocking configurado
- [ ] Database sync testing
- [ ] Coverage >70%

---

### **🔧 SEMANA 2: E2E & CI/CD**

#### **DAY 6-7: E2E Tests com Playwright**

##### **Task 6.1: Configurar Playwright**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

```javascript
// 📁 playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});
```

##### **Task 6.2: E2E Tests Críticos**
```javascript
// 📁 tests/e2e/customer-journey.spec.js
import { test, expect } from '@playwright/test';

test.describe('Customer Menu Journey', () => {
    test('should browse menu and view product details', async ({ page }) => {
        await page.goto('/');
        
        // Should load restaurant info
        await expect(page.locator('[data-testid="restaurant-name"]')).toContainText('Imperio do Churrasco');
        
        // Should display categories
        await expect(page.locator('[data-testid="category-menu"]')).toBeVisible();
        
        // Should show featured products
        await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
        
        // Click on a category
        await page.click('[data-category="Especiais da Casa"]');
        
        // Should filter products
        await expect(page.locator('[data-testid="products-grid"]')).toBeVisible();
        
        // Click on product to view details (if modal exists)
        await page.click('[data-testid="product-card"]:first-child');
        
        // Should show product details
        await expect(page.locator('[data-testid="product-modal"]')).toBeVisible();
    });
    
    test('should search for products', async ({ page }) => {
        await page.goto('/');
        
        // Open search
        await page.click('[data-testid="search-toggle"]');
        
        // Type search query
        await page.fill('[data-testid="search-input"]', 'pizza');
        
        // Should show search results
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
        
        // Results should contain pizza items
        const results = page.locator('[data-testid="product-card"]');
        await expect(results.first()).toContainText(/pizza/i);
    });
    
    test('should handle mobile navigation', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        
        // Mobile menu should be hidden initially
        await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
        
        // Open mobile menu
        await page.click('[data-testid="mobile-menu-toggle"]');
        
        // Should show mobile menu
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        
        // Categories should be accessible
        await page.click('[data-testid="mobile-category-link"]:first-child');
        
        // Should navigate to category
        await expect(page.locator('[data-testid="category-products"]')).toBeVisible();
    });
});
```

##### **Task 6.3: Admin E2E Tests**
```javascript
// 📁 tests/e2e/admin-workflow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Admin Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/admin.html');
        await page.fill('[data-testid="username"]', 'admin');
        await page.fill('[data-testid="password"]', 'admin123');
        await page.click('[data-testid="login-button"]');
        
        // Wait for dashboard
        await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    });
    
    test('should manage products end-to-end', async ({ page }) => {
        // Navigate to products
        await page.click('[data-testid="nav-products"]');
        
        // Add new product
        await page.click('[data-testid="add-product-button"]');
        
        // Fill product form
        await page.fill('[data-testid="product-name"]', 'Test Pizza E2E');
        await page.fill('[data-testid="product-description"]', 'Pizza created via E2E test');
        await page.fill('[data-testid="product-price"]', '35.90');
        await page.selectOption('[data-testid="product-category"]', 'cat1');
        
        // Upload image (if implemented)
        const fileInput = page.locator('[data-testid="product-image"]');
        await fileInput.setInputFiles('tests/fixtures/pizza-test.jpg');
        
        // Save product
        await page.click('[data-testid="save-product"]');
        
        // Should show success message
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Produto adicionado');
        
        // Product should appear in list
        await expect(page.locator('[data-testid="product-list"]')).toContainText('Test Pizza E2E');
        
        // Edit product
        await page.click('[data-testid="edit-product"]:has-text("Test Pizza E2E")');
        await page.fill('[data-testid="product-price"]', '39.90');
        await page.click('[data-testid="save-product"]');
        
        // Should show updated price
        await expect(page.locator('[data-testid="product-list"]')).toContainText('39,90');
        
        // Delete product
        await page.click('[data-testid="delete-product"]:has-text("Test Pizza E2E")');
        await page.click('[data-testid="confirm-delete"]');
        
        // Product should be removed
        await expect(page.locator('[data-testid="product-list"]')).not.toContainText('Test Pizza E2E');
    });
    
    test('should manage categories with drag and drop', async ({ page }) => {
        await page.click('[data-testid="nav-categories"]');
        
        // Get initial order
        const initialFirst = await page.locator('[data-testid="category-item"]:first-child').textContent();
        const initialSecond = await page.locator('[data-testid="category-item"]:nth-child(2)').textContent();
        
        // Drag first item to second position
        await page.dragAndDrop(
            '[data-testid="category-item"]:first-child [data-testid="drag-handle"]',
            '[data-testid="category-item"]:nth-child(2)'
        );
        
        // Should show success message
        await expect(page.locator('[data-testid="success-message"]')).toContainText('Ordem atualizada');
        
        // Order should be changed
        const newFirst = await page.locator('[data-testid="category-item"]:first-child').textContent();
        expect(newFirst).toBe(initialSecond);
    });
});
```

##### **✅ Critério de Aceite:**
- [ ] E2E tests para customer journey
- [ ] E2E tests para admin workflows
- [ ] Cross-browser testing
- [ ] Mobile testing

---

#### **DAY 8-9: Visual Regression & Performance Tests**

##### **Task 8.1: Visual Regression Tests**
```bash
npm install --save-dev @playwright/test
```

```javascript
// 📁 tests/visual/components.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
    test('product card component should match design', async ({ page }) => {
        await page.goto('/');
        
        // Wait for products to load
        await page.waitForSelector('[data-testid="product-card"]');
        
        // Take screenshot of first product card
        const productCard = page.locator('[data-testid="product-card"]').first();
        await expect(productCard).toHaveScreenshot('product-card.png');
    });
    
    test('admin dashboard should match design', async ({ page }) => {
        // Login
        await page.goto('/admin.html');
        await page.fill('[data-testid="username"]', 'admin');
        await page.fill('[data-testid="password"]', 'admin123');
        await page.click('[data-testid="login-button"]');
        
        // Wait for dashboard
        await page.waitForSelector('[data-testid="admin-dashboard"]');
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot('admin-dashboard.png', { fullPage: true });
    });
    
    test('mobile menu should match design', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        
        // Open mobile menu
        await page.click('[data-testid="mobile-menu-toggle"]');
        await page.waitForSelector('[data-testid="mobile-menu"]');
        
        // Screenshot mobile menu
        await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('mobile-menu.png');
    });
});
```

##### **Task 8.2: Performance Tests**
```javascript
// 📁 tests/performance/lighthouse.spec.js
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Tests', () => {
    test('home page should meet performance benchmarks', async ({ page }) => {
        await page.goto('/');
        
        const audit = await playAudit({
            page,
            thresholds: {
                performance: 90,
                accessibility: 90,
                'best-practices': 80,
                seo: 80
            }
        });
        
        expect(audit.lhr.categories.performance.score * 100).toBeGreaterThan(90);
    });
    
    test('should load products within performance budget', async ({ page }) => {
        // Intercept network requests
        const responses = [];
        page.on('response', response => responses.push(response));
        
        const startTime = Date.now();
        await page.goto('/');
        
        // Wait for products to load
        await page.waitForSelector('[data-testid="products-grid"]');
        const loadTime = Date.now() - startTime;
        
        // Should load within 2 seconds
        expect(loadTime).toBeLessThan(2000);
        
        // Should not make excessive API calls
        const apiCalls = responses.filter(r => r.url().includes('supabase.co'));
        expect(apiCalls.length).toBeLessThan(10);
    });
    
    test('should handle large product lists efficiently', async ({ page }) => {
        // Mock large dataset
        await page.route('**/rest/v1/products*', route => {
            const products = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `Product ${i}`,
                price: Math.random() * 100,
                active: true
            }));
            
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(products)
            });
        });
        
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForSelector('[data-testid="products-grid"]');
        const renderTime = Date.now() - startTime;
        
        // Should render large list within 3 seconds
        expect(renderTime).toBeLessThan(3000);
        
        // Check memory usage (if API available)
        const memoryUsage = await page.evaluate(() => {
            return performance.memory ? performance.memory.usedJSHeapSize : 0;
        });
        
        // Should use less than 100MB
        expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
    });
});
```

##### **✅ Critério de Aceite:**
- [ ] Visual regression tests configurados
- [ ] Performance benchmarks definidos
- [ ] Lighthouse scores >90 performance
- [ ] Memory usage <100MB

---

#### **DAY 10: CI/CD Pipeline**

##### **Task 10.1: GitHub Actions Workflow**
```yaml
# 📁 .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint code
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
      
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Run performance tests
      run: npm run test:performance
      
    - name: Security audit
      run: npm audit --audit-level high

  quality-gates:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check test coverage
      run: |
        npm run test:coverage
        COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
        if (( $(echo "$COVERAGE < 80" | bc -l) )); then
          echo "Coverage $COVERAGE% is below 80% threshold"
          exit 1
        fi
    
    - name: Check bundle size
      run: |
        npm run build
        BUNDLE_SIZE=$(du -k dist/assets/*.js | cut -f1 | paste -sd+ | bc)
        if [ $BUNDLE_SIZE -gt 500 ]; then
          echo "Bundle size ${BUNDLE_SIZE}KB exceeds 500KB limit"
          exit 1
        fi

  deploy:
    needs: [test, quality-gates]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

##### **Task 10.2: Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --config jest.config.js",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "playwright test tests/performance",
    "test:visual": "playwright test tests/visual",
    "test:coverage": "jest --coverage --config jest.config.js",
    "test:watch": "jest --watch",
    "lint": "eslint src/js/**/*.js",
    "lint:fix": "eslint src/js/**/*.js --fix",
    "type-check": "tsc --noEmit",
    "security:audit": "npm audit --audit-level high",
    "security:fix": "npm audit fix",
    "analyze:bundle": "vite-bundle-analyzer dist/stats.json",
    "clean": "rm -rf dist coverage test-results",
    "precommit": "npm run lint && npm run test:unit",
    "prepush": "npm run test && npm run build"
  }
}
```

##### **Task 10.3: Quality Gates Configuration**
```javascript
// 📁 quality-gates.config.js
export default {
    coverage: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
    },
    performance: {
        lighthouse: {
            performance: 90,
            accessibility: 90,
            bestPractices: 80,
            seo: 80
        },
        bundleSize: {
            maxSize: '500KB',
            warn: '400KB'
        },
        loadTime: {
            maxTime: 2000, // ms
            warn: 1500
        }
    },
    security: {
        vulnerabilities: {
            high: 0,
            moderate: 5,
            low: 10
        }
    },
    codeQuality: {
        eslintErrors: 0,
        eslintWarnings: 10,
        duplicateCode: 5 // percentage
    }
};
```

##### **✅ Critério de Aceite:**
- [ ] CI/CD pipeline funcionando
- [ ] Quality gates configurados
- [ ] Deploy automático para main
- [ ] Branch protection rules

---

## 📊 MÉTRICAS DE SUCESSO FINAIS

### **Test Coverage:**
- [ ] **Unit Tests:** 80%+ coverage
- [ ] **Integration Tests:** Cobertura em features críticas
- [ ] **E2E Tests:** User journeys principais
- [ ] **Visual Regression:** Components críticos

### **Quality Gates:**
- [ ] **Zero** vulnerabilidades críticas
- [ ] **Zero** testes falhando
- [ ] **80%+** code coverage
- [ ] **<500KB** bundle size
- [ ] **90+** Lighthouse performance score

### **CI/CD Metrics:**
- [ ] **<10min** pipeline execution time
- [ ] **95%+** pipeline success rate
- [ ] **Zero** manual deploy steps
- [ ] **Automated** rollback on failure

---

## 🚀 ENTREGÁVEIS FINAIS

### **Test Suite Completo:**
- [ ] `tests/unit/` - Unit tests (80%+ coverage)
- [ ] `tests/integration/` - Integration tests
- [ ] `tests/e2e/` - E2E tests (Playwright)
- [ ] `tests/performance/` - Performance tests
- [ ] `tests/visual/` - Visual regression tests

### **CI/CD Pipeline:**
- [ ] GitHub Actions workflow
- [ ] Quality gates enforcement
- [ ] Automated deployment
- [ ] Branch protection rules

### **Documentação:**
- [ ] Testing guidelines
- [ ] CI/CD runbook
- [ ] Quality standards
- [ ] Troubleshooting guide

---

**🎯 PRÓXIMO PASSO:** Finalizar e iniciar **FASE 5: MONITORING & OBSERVABILIDADE**

**⚠️ BLOQUEADORES:** Pipeline CI/CD deve estar 100% estável antes da próxima fase