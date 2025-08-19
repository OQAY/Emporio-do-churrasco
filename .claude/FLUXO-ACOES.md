# 🎬 FLUXO DE AÇÕES - MENU ONLINE

## 📱 CENÁRIO 1: CLIENTE ACESSA CARDÁPIO

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant B as 🌐 Browser
    participant V as 📱 MenuView
    participant C as 🎮 Controller
    participant S as 💼 Service
    participant R as 🗄️ Repository
    participant D as 💾 Database

    U->>B: Acessa site
    B->>V: Carrega index.html
    V->>C: Inicializa ProductController
    C->>S: Chama ProductService
    S->>R: Acessa ProductRepository
    R->>D: Lê LocalStorage
    D-->>R: Retorna dados
    R-->>S: Lista de produtos
    S-->>C: Produtos validados
    C-->>V: Renderiza interface
    V-->>U: 🎨 Mostra cardápio
```

## 🔍 CENÁRIO 2: BUSCA DE PRODUTOS

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant V as 📱 MenuView
    participant C as 🎮 Controller
    participant SEC as 🛡️ Sanitizer
    participant S as 💼 Service
    participant R as 🗄️ Repository

    U->>V: Digita "pizza"
    V->>C: searchProducts("pizza")
    C->>SEC: sanitizeText("pizza")
    SEC-->>C: "pizza" ✅ limpo
    C->>S: searchProducts("pizza")
    S->>S: Valida termo (min 2 chars)
    S->>R: getProducts({search: "pizza"})
    R-->>S: Lista filtrada
    S->>S: Calcula relevância
    S->>S: Adiciona highlights
    S-->>C: Resultados processados
    C-->>V: renderSearchResults()
    V-->>U: 🎨 Mostra "Pizza Margherita"
```

## 👨‍💼 CENÁRIO 3: ADMIN ADICIONA PRODUTO

```mermaid
sequenceDiagram
    participant A as 👨‍💼 Admin
    participant AV as 🖥️ AdminView
    participant AC as 🎮 AdminController
    participant SEC as 🛡️ Sanitizer
    participant PS as 💼 ProductService
    participant CS as 💼 CategoryService
    participant PR as 🗄️ ProductRepo
    participant L as 📝 Logger

    A->>AV: Clica "Adicionar Produto"
    AV->>AV: Mostra modal
    A->>AV: Preenche dados
    A->>AV: Clica "Salvar"
    AV->>AC: createProduct(dados)
    AC->>SEC: sanitizeProductData()
    SEC-->>AC: Dados limpos ✅
    AC->>PS: createProduct(dados)
    PS->>PS: validateProductForCreation()
    PS->>PS: checkProductDuplicates()
    PS->>CS: verifyCategoryExists()
    CS-->>PS: Categoria OK ✅
    PS->>PR: addProduct(dados)
    PR-->>PS: Produto criado
    PS->>L: Log "PRODUCT_CREATED"
    PS-->>AC: Produto salvo ✅
    AC-->>AV: refreshProductList()
    AV-->>A: 🎉 "Produto adicionado!"
```

## ❌ CENÁRIO 4: ERRO E RECUPERAÇÃO

```mermaid
sequenceDiagram
    participant U as 👤 Usuário
    participant S as 💼 Service
    participant CB as ⚡ CircuitBreaker
    participant RH as 🔄 RetryHandler
    participant EH as 🚨 ErrorHandler
    participant L as 📝 Logger
    participant N as 📢 Notification

    U->>S: Ação qualquer
    S->>CB: Executa operação
    CB->>CB: ❌ Operação falha
    CB->>RH: Trigga retry
    RH->>RH: Tentativa 1 ❌
    RH->>RH: Tentativa 2 ❌
    RH->>RH: Tentativa 3 ❌
    RH->>CB: Muitas falhas
    CB->>CB: OPEN circuit
    CB->>EH: Erro crítico
    EH->>L: Registra erro
    EH->>N: Notifica usuário
    N-->>U: 🔴 "Erro temporário, tente novamente"
    
    Note over CB: Após 30s, circuit fica HALF_OPEN
    U->>S: Tenta novamente
    S->>CB: Executa operação
    CB->>CB: ✅ Sucesso!
    CB->>CB: CLOSE circuit
    CB-->>U: 🟢 Sistema recuperado
```

## 🔐 CENÁRIO 5: ATAQUE XSS BLOQUEADO

```mermaid
sequenceDiagram
    participant H as 🦹‍♂️ Hacker
    participant V as 📱 View
    participant SEC as 🛡️ Sanitizer
    participant SA as 🛡️ SecurityAudit
    participant L as 📝 Logger
    participant A as 👨‍💼 Admin

    H->>V: Digita "<script>alert('hack')</script>"
    V->>SEC: sanitizeText(input)
    SEC->>SEC: Detecta script malicioso
    SEC->>SA: Reporta tentativa de ataque
    SA->>L: Log security incident
    SEC-->>V: Retorna texto limpo: "alert('hack')"
    L->>A: 🚨 Alert: "Tentativa XSS detectada"
    V-->>H: Mostra texto sem execução
    
    Note over SEC: XSS BLOQUEADO ✅
```

## 🏗️ ARQUITETURA EM CAMADAS

```
🎨 APRESENTAÇÃO    │ Como o usuário vê e interage
├─ MenuView.js     │ Cardápio bonito para clientes
├─ AdminView.js    │ Interface limpa para administração
└─ Layout/CSS      │ Design responsivo e moderno

🎮 CONTROLE        │ Coordena ações do usuário
├─ ProductController │ "Usuário quer ver produtos"
├─ AdminController   │ "Admin quer gerenciar"
└─ Routing          │ "Vai para página correta"

💼 NEGÓCIO         │ Regras importantes da empresa
├─ ProductService  │ "Produto deve ter preço válido"
├─ CategoryService │ "Categoria não pode estar vazia"
└─ Validation      │ "Dados devem estar corretos"

🗄️ DADOS           │ Onde as informações ficam guardadas
├─ ProductRepository │ "CRUD de produtos"
├─ CategoryRepository│ "CRUD de categorias"
└─ LocalStorage     │ "Banco de dados do browser"

🛡️ SEGURANÇA       │ Protege contra ataques
├─ InputSanitizer  │ "Remove códigos maliciosos"
├─ SecurityAudit   │ "Monitora tentativas de hack"
└─ PasswordManager │ "Senhas com hash seguro"

⚡ INFRAESTRUTURA   │ Sistemas que nunca param
├─ ErrorHandler    │ "Captura erros antes de quebrar"
├─ CircuitBreaker  │ "Para cascata de falhas"
├─ RetryHandler    │ "Tenta novamente se falhar"
├─ Logger          │ "Registra tudo que acontece"
└─ HealthCheck     │ "Verifica se tudo está OK"
```

## 🚀 MOMENTOS DE USO REAL

### 🌅 **MANHÃ - ABERTURA DO RESTAURANTE**
```
08:00 - Admin abre sistema
      ↓
📊 HealthCheck verifica se tudo OK
📝 Logger registra: "Sistema iniciado"
🛡️ SecurityAudit ativo
⚡ CircuitBreakers em CLOSED (funcionando)
      ↓
✅ Sistema pronto para o dia
```

### 🍽️ **HORÁRIO DE ALMOÇO - PICO DE CLIENTES**
```
12:00-14:00 - Muitos acessos simultâneos
      ↓
📱 MenuView renderiza cardápio 100x/min
🔍 Buscas: "pizza", "hambúrguer", "salada"
🛡️ InputSanitizer limpa TODOS os inputs
📝 Logger registra cada busca
⚡ CircuitBreaker protege contra sobrecarga
      ↓
🎯 Todos os clientes veem cardápio instantaneamente
```

### 🌃 **NOITE - ATUALIZAÇÃO DO CARDÁPIO**
```
20:00 - Admin atualiza preços e produtos
      ↓
👨‍💼 AdminController processa mudanças
💼 ProductService valida todos os dados
🗄️ Repository salva no LocalStorage
📝 Logger registra: "15 produtos atualizados"
🛡️ SecurityAudit monitora operações
      ↓
✅ Cardápio atualizado para o próximo dia
```

### 🚨 **SITUAÇÃO DE EMERGÊNCIA - ERRO DE REDE**
```
Conexão instável causa falhas
      ↓
❌ ProductRepository falha 3x seguidas
⚡ CircuitBreaker abre (OPEN)
🔄 RetryHandler para de tentar
🚨 ErrorHandler captura situação
📢 NotificationService avisa usuário
📝 Logger registra incidente
      ↓
🔄 Após 30s, tenta novamente
✅ Conexão volta, sistema recupera
⚡ CircuitBreaker fecha (CLOSED)
```

## 🎯 **RESUMO: CADA PARTE TEM SEU MOMENTO**

| **Quando acontece** | **O que é usado** | **Para que serve** |
|---------------------|-------------------|-------------------|
| **Todo acesso** | ErrorHandler, Logger | Garantir que nada quebra |
| **Usuário digita** | InputSanitizer | Evitar ataques XSS |
| **Busca produtos** | ProductService, Repository | Encontrar o que cliente quer |
| **Admin gerencia** | AdminController, Services | Manter cardápio atualizado |
| **Sistema falha** | CircuitBreaker, RetryHandler | Recuperar automaticamente |
| **Operação crítica** | Logger, SecurityAudit | Rastrear e auditar tudo |

**🎊 RESULTADO: Sistema que funciona 24/7 sem supervisão!**