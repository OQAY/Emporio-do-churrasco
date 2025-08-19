# 🏗️ DIAGRAMA DE ARQUITETURA - MENU ONLINE

## 📋 VISÃO GERAL DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 BROWSER (CLIENTE)                        │
├─────────────────────────────────────────────────────────────────┤
│  📱 INTERFACE DO USUÁRIO                                       │
│  ├── index.html (Cardápio Principal)                          │
│  ├── admin.html (Painel Administrativo)                       │
│  └── 🎨 CSS + Tailwind (Estilização)                         │
├─────────────────────────────────────────────────────────────────┤
│  🧠 CAMADA DE APRESENTAÇÃO (VIEW LAYER)                       │
│  ├── MenuView.js - Renderiza cardápio para clientes          │
│  ├── AdminView.js - Interface administrativa                  │
│  └── AdminLayout.js - Layout e navegação                     │
├─────────────────────────────────────────────────────────────────┤
│  🎮 CAMADA DE CONTROLE (CONTROLLER LAYER)                     │
│  ├── ProductController.js - Gerencia produtos                 │
│  ├── AdminController.js - Operações administrativas           │
│  └── Coordena View ↔ Service                                 │
├─────────────────────────────────────────────────────────────────┤
│  💼 CAMADA DE NEGÓCIO (SERVICE LAYER)                         │
│  ├── ProductService.js - Regras de negócio produtos          │
│  ├── CategoryService.js - Regras de negócio categorias       │
│  ├── ServiceFactory.js - Gerencia dependências               │
│  └── ✅ Validação, Sanitização, Business Rules               │
├─────────────────────────────────────────────────────────────────┤
│  🗄️ CAMADA DE DADOS (REPOSITORY LAYER)                        │
│  ├── ProductRepository.js - CRUD produtos                     │
│  ├── CategoryRepository.js - CRUD categorias                  │
│  ├── Database.js - Coordenação de dados                      │
│  └── 💾 LocalStorage (Dados persistidos)                     │
├─────────────────────────────────────────────────────────────────┤
│  🛡️ CAMADA DE SEGURANÇA (SECURITY LAYER)                      │
│  ├── InputSanitizer.js - Previne XSS                         │
│  ├── PasswordManager.js - Hash bcrypt                        │
│  ├── SecurityAudit.js - Auditoria contínua                   │
│  └── 🔒 HTTPS Enforcer                                       │
├─────────────────────────────────────────────────────────────────┤
│  ⚡ CAMADA DE INFRAESTRUTURA (CORE LAYER)                     │
│  ├── ErrorHandler.js - Captura todos os erros               │
│  ├── Logger.js - Logs estruturados                          │
│  ├── CircuitBreaker.js - Evita falhas em cascata            │
│  ├── RetryHandler.js - Tentativas automáticas               │
│  ├── EventManager.js - Gerencia memória                     │
│  └── HealthCheck.js - Monitora sistema                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 FLUXO DE EXECUÇÃO - QUANDO CADA COISA ACONTECE

### 🚀 1. INICIALIZAÇÃO DO SISTEMA

```
USUÁRIO ACESSA O SITE
        ↓
┌─────────────────────┐
│   app.js INICIA     │ ←── Ponto de entrada
└─────────────────────┘
        ↓
┌─────────────────────┐
│ AppInitializer.js   │ ←── Inicializa sistemas críticos
│ ✅ ErrorHandler     │
│ ✅ Logger           │
│ ✅ SecuritySystems  │
│ ✅ CircuitBreakers  │
│ ✅ HealthMonitoring │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ServiceFactory.js   │ ←── Configura camada de negócio
│ ✅ ProductService   │
│ ✅ CategoryService  │
│ ✅ Repositories     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductController   │ ←── Carrega dados iniciais
│ ✅ loadCategories() │
│ ✅ loadProducts()   │
└─────────────────────┘
        ↓
┌─────────────────────┐
│   MenuView.js       │ ←── Renderiza interface
│ 🎨 Mostra cardápio  │
└─────────────────────┘
```

### 👤 2. USUÁRIO NAVEGA NO CARDÁPIO

```
USUÁRIO CLICA EM CATEGORIA
        ↓
┌─────────────────────┐
│ MenuView.js         │ ←── Captura evento
│ addEventListener    │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductController   │ ←── Processa ação
│ filterByCategory()  │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductService.js   │ ←── Aplica regras de negócio
│ getProductsByCategory() │
│ ✅ Valida entrada   │
│ ✅ Aplica filtros   │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductRepository   │ ←── Acessa dados
│ getProducts()       │
│ 🔄 Retry se falhar  │
│ ⚡ Circuit Breaker  │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ MenuView.js         │ ←── Atualiza interface
│ renderProducts()    │
│ 🎨 Mostra produtos  │
└─────────────────────┘
```

### 🔍 3. USUÁRIO FAZ BUSCA

```
USUÁRIO DIGITA BUSCA
        ↓
┌─────────────────────┐
│ MenuView.js         │ ←── Input de busca
│ searchInput.oninput │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductController   │ ←── Processa busca
│ searchProducts()    │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ InputSanitizer.js   │ ←── 🛡️ Segurança primeiro
│ sanitizeText()      │
│ ❌ Remove XSS       │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductService.js   │ ←── Lógica de busca
│ searchProducts()    │
│ ✅ Valida termo     │
│ ✅ Score relevância │
│ ✅ Highlights       │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductRepository   │ ←── Query dados
│ getProducts(search) │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ MenuView.js         │ ←── Mostra resultados
│ renderSearchResults()│
│ 🎨 Com highlights   │
└─────────────────────┘
```

### 👨‍💼 4. ADMIN GERENCIA PRODUTOS

```
ADMIN ACESSA /admin.html
        ↓
┌─────────────────────┐
│ AdminView.js        │ ←── Interface admin
│ render()            │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ AdminController     │ ←── Carrega dados admin
│ loadDashboard()     │
└─────────────────────┘
        ↓
ADMIN CLICA "ADICIONAR PRODUTO"
        ↓
┌─────────────────────┐
│ AdminView.js        │ ←── Mostra modal
│ showProductModal()  │
└─────────────────────┘
        ↓
ADMIN PREENCHE DADOS E SALVA
        ↓
┌─────────────────────┐
│ AdminController     │ ←── Processa criação
│ createProduct()     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ InputSanitizer.js   │ ←── 🛡️ Limpa todos inputs
│ sanitizeProductData()│
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductService.js   │ ←── Valida negócio
│ createProduct()     │
│ ✅ Campos obrigatórios│
│ ✅ Preço válido     │
│ ✅ Categoria existe │
│ ✅ Não duplicado    │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ ProductRepository   │ ←── Salva no banco
│ addProduct()        │
│ 💾 LocalStorage     │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Logger.js           │ ←── 📝 Registra ação
│ "PRODUCT_CREATED"   │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ AdminView.js        │ ←── Atualiza lista
│ refreshProductList()│
│ 🎉 Mostra sucesso   │
└─────────────────────┘
```

## ❌ FLUXO DE TRATAMENTO DE ERROS

```
QUALQUER ERRO ACONTECE
        ↓
┌─────────────────────┐
│ ErrorHandler.js     │ ←── 🚨 Captura global
│ window.onerror      │
│ unhandledrejection  │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ Logger.js           │ ←── 📝 Registra erro
│ Structured logging  │
│ Error stack trace   │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ CircuitBreaker.js   │ ←── 🔌 Verifica falhas
│ Se muitos erros:    │
│ OPEN circuit        │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ RetryHandler.js     │ ←── 🔄 Tenta novamente
│ Exponential backoff │
│ Max 3 tentativas    │
└─────────────────────┘
        ↓
┌─────────────────────┐
│ NotificationService │ ←── 👤 Avisa usuário
│ showError()         │
│ 🎨 Toast amigável   │
└─────────────────────┘
```

## 🔧 PARA QUE SERVE CADA PARTE

| **Componente** | **Para que serve** | **Quando é usado** |
|----------------|-------------------|-------------------|
| **ErrorHandler** | Captura TODOS os erros do sistema | Sempre ativo, captura erros não tratados |
| **Logger** | Registra tudo que acontece | A cada operação, para auditoria |
| **CircuitBreaker** | Evita que sistema quebre todo | Quando há muitas falhas seguidas |
| **RetryHandler** | Tenta operação novamente se falhar | Em operações de rede/banco instáveis |
| **InputSanitizer** | Remove código malicioso | Sempre que usuário digita algo |
| **ProductService** | Regras de negócio de produtos | Criar, editar, validar produtos |
| **CategoryService** | Regras de negócio de categorias | Gerenciar ordem, validar categorias |
| **Repository** | Acesso direto aos dados | CRUD no LocalStorage |
| **Controller** | Coordena View e Service | Quando usuário interage com interface |
| **View** | Renderiza interface visual | Sempre que precisa mostrar algo |

## 🎯 MOMENTOS CRÍTICOS DO SISTEMA

### 🟢 **INICIALIZAÇÃO (1-2 segundos)**
- Sistema verifica se tudo está funcionando
- Carrega dados iniciais
- Prepara interface

### 🔵 **NAVEGAÇÃO NORMAL (< 100ms)**
- Usuário clica, sistema responde instantaneamente
- Dados já estão carregados na memória

### 🟡 **BUSCA EM TEMPO REAL (< 200ms)**
- A cada letra digitada, busca atualiza
- Sanitização e validação acontecem

### 🟠 **OPERAÇÕES ADMIN (< 500ms)**
- Criação/edição com validação completa
- Múltiplas verificações de segurança

### 🔴 **RECUPERAÇÃO DE ERRO (1-3 segundos)**
- Sistema detecta problema
- Tenta recuperar automaticamente
- Notifica usuário se necessário

Este sistema garante que **NUNCA QUEBRA** e sempre funciona de forma previsível! 🚀