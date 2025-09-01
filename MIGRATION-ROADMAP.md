# 🚀 ROADMAP DE MIGRAÇÃO - EMPÓRIO DO CHURRASCO
## Vanilla JS → Next.js 14 + TypeScript

---

## 📋 SUMÁRIO EXECUTIVO

**Projeto:** Migração completa de Vanilla JS para Next.js 14  
**Duração:** 5-7 dias  
**Prioridade:** Performance mobile + Stack moderna  
**Regra #1:** ZERO alterações visuais - preservar 100% do UI/UX atual  

---

## 🎯 OBJETIVOS

### Principais
1. **Migrar para Next.js 14** com App Router
2. **Adicionar TypeScript** para type safety
3. **Melhorar performance** em 50-70%
4. **Manter UI/UX idêntico** ao atual
5. **Preservar todas funcionalidades** existentes

### Secundários
- Implementar SSR/SSG para SEO
- Otimizar bundle size
- Adicionar cache inteligente
- Melhorar Core Web Vitals

---

## 🏗️ ARQUITETURA

### ATUAL (Vanilla JS)
```
emporio-churrasco/
├── index.html                 # Entry point
├── admin.html                 # Painel admin
├── src/
│   ├── styles/
│   │   ├── main.css          # 431 linhas - PRESERVAR TUDO
│   │   └── admin.css         # Estilos admin
│   ├── js/
│   │   ├── app.js            # Main app
│   │   ├── admin.js          # Admin panel
│   │   ├── database.js       # Supabase client
│   │   ├── views/            # View components
│   │   └── controllers/      # Business logic
│   └── data/
│       └── data.json         # Fallback data
└── public/
    └── images/               # Static assets
```

### NOVA (Next.js 14)
```
emporio-next/
├── app/                      # App Router
│   ├── layout.tsx           # Root layout (index.html structure)
│   ├── page.tsx             # Home (main menu)
│   ├── globals.css          # main.css COPIADO EXATO
│   ├── admin/
│   │   ├── layout.tsx       # Admin layout
│   │   ├── page.tsx         # Admin dashboard
│   │   └── admin.css        # Admin styles COPIADO
│   └── api/
│       ├── products/        # Products API
│       └── categories/      # Categories API
├── components/
│   ├── MenuView.tsx         # MenuView.js CONVERTIDO
│   ├── ProductCard.tsx      # Product card component
│   ├── ProductModal.tsx     # Product detail modal
│   ├── CategoryBar.tsx      # Category navigation
│   └── Cart.tsx             # Shopping cart
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── hooks/
│   ├── useProducts.ts      # Products hook
│   ├── useCategories.ts    # Categories hook
│   └── useCart.ts          # Cart state
└── public/
    └── images/              # Static assets COPIADO
```

---

## 📊 ELEMENTOS A PRESERVAR (CRÍTICO!)

### CSS - COPIAR 100% EXATO
```css
/* main.css - 431 linhas */
:root {
    --primary-color: #fb923c;    /* NÃO MUDAR */
    --secondary-color: #f97316;   /* NÃO MUDAR */
}

/* Breakpoints EXATOS */
@media (max-width: 742px)  /* Mobile */
@media (min-width: 743px)  /* Tablet */
@media (min-width: 1024px) /* Desktop */

/* Touch targets */
min-height: 44px;
min-width: 44px;

/* Grids EXATOS */
.products-grid: 1fr (mobile), 2fr (tablet), 3fr (desktop)
.featured-grid: sempre 2 colunas
```

### HTML Structure - MANTER IDÊNTICO
- Header com logo e navegação
- Category bar horizontal com scroll
- Featured products (2 colunas)
- Products grid
- Product modal
- Cart bottom sheet

### Funcionalidades - PRESERVAR TODAS
- [x] Navegação por categorias
- [x] Scroll horizontal categorias
- [x] Modal de produto
- [x] Adicionar ao carrinho
- [x] Contador de quantidade
- [x] Busca de produtos
- [x] Lazy loading imagens
- [x] PWA offline
- [x] WhatsApp checkout

---

## 📅 CRONOGRAMA DETALHADO

### DIA 1 - Setup e Estrutura Base ✅ CONCLUÍDO
```bash
[✅] Verificar backup completo
[✅] Limpar projeto (manter apenas backup)
[✅] Setup Next.js 14 manual com TypeScript + Tailwind
[✅] Copiar main.css → globals.css (SEM ALTERAÇÕES - 431 linhas)
[✅] Configurar tailwind.config.js com cores exatas (#fb923c, #f97316)
[✅] Copiar estrutura HTML para layout.tsx
[✅] Commit: "setup: initial Next.js structure with preserved styles"
```

### DIA 2 - Migração de Componentes Core ✅ CONCLUÍDO
```bash
[✅] MenuView.js → MenuView.tsx (preservar estrutura)
[✅] Criar types.ts com TypeScript types
[✅] Testar renderização básica
[✅] Commit: "migrate: core MenuView component with preserved UI"
[✅] ProductCard integrado no MenuView
[✅] CategoryBar integrado no MenuView
[✅] Testar renderização idêntica completa
```

### DIA 3 - Integração Supabase ✅ CONCLUÍDO
```bash
[✅] database-nasa.js → lib/supabase.ts (MESMA lógica)
[✅] Types.ts com estrutura EXATA do data.json
[✅] Implementar hooks useData (MESMO comportamento)
[✅] Manter mesmas queries e cache (DatabaseNASA preservado)
[✅] Commit: "integrate: Supabase with TypeScript hooks"
```

### DIA 4 - Features Complexas ✅ CONCLUÍDO
```bash
[✅] ProductModal.tsx com mesma animação (slide-up/fade-in preservadas)
[✅] Store Zustand para cart (localStorage persistence)
[✅] Cart counter integrado no header
[✅] Commit: "features: product modal and cart store with Zustand"
[ ] Search functionality (próximo)
[ ] WhatsApp integration (próximo)
[ ] Cart drawer/modal completo
```

### DIA 5 - Admin Panel ✅ CONCLUÍDO
```bash
[✅] admin.html → app/admin/page.tsx (estrutura preservada)
[✅] Copiar admin.css exato (sem alterações)
[✅] Admin layout com loading overlay original
[✅] Dashboard básico funcional
[✅] Commit: "admin: complete admin panel with preserved layout"
```

### DIA 6 - Otimizações (sem visual)
```bash
[ ] Next/Image com mesmas dimensões
[ ] API routes para cache
[ ] Service Worker para PWA
[ ] Bundle optimization
[ ] Commit: "optimize: performance improvements"
```

### DIA 7 - Testing e Deploy
```bash
[ ] Comparação visual pixel-perfect
[ ] Testes em dispositivos reais
[ ] Performance metrics
[ ] Deploy Vercel
[ ] Commit: "deploy: production ready"
```

---

## ⚠️ CHECKLIST DE VALIDAÇÃO

### Antes de cada commit:
- [ ] UI idêntico ao original?
- [ ] Funcionalidade preservada?
- [ ] Sem "melhorias" não solicitadas?
- [ ] Código testado?
- [ ] Performance melhor ou igual?

### Visual (ZERO mudanças)
- [ ] Cores exatas (#fb923c, #f97316)
- [ ] Fontes idênticas
- [ ] Espaçamentos iguais
- [ ] Animações preservadas
- [ ] Breakpoints mantidos (742px)
- [ ] Grid layouts idênticos

### Funcional (100% preservado)
- [ ] Todas features funcionando
- [ ] Mesmo comportamento
- [ ] Mesma navegação
- [ ] Mesmos modais
- [ ] Mesmas interações

---

## 🚫 O QUE NÃO FAZER

### UI/UX
- ❌ NÃO mudar cores
- ❌ NÃO alterar espaçamentos
- ❌ NÃO "melhorar" design
- ❌ NÃO adicionar animações
- ❌ NÃO mudar layouts

### Código
- ❌ NÃO criar arquivos > 500 linhas
- ❌ NÃO fazer commits gigantes
- ❌ NÃO pular testes
- ❌ NÃO inventar features
- ❌ NÃO otimizar prematuramente

---

## 📝 ESTRUTURA DE COMMITS

```bash
# Formato
tipo: descrição curta (máx 50 chars)

# Tipos
setup:    configuração inicial
migrate:  migração de código
convert:  conversão de componentes
feature:  nova funcionalidade
optimize: otimização performance
fix:      correção de bugs
test:     adição de testes
deploy:   preparação para deploy

# Exemplos
setup: initial Next.js 14 project
migrate: MenuView component to TypeScript
convert: Supabase integration
optimize: add image lazy loading
deploy: production configuration
```

---

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- [ ] LCP < 2.5s (mobile 3G)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Lighthouse > 90

### Funcional
- [ ] 100% features preservadas
- [ ] Zero bugs visuais
- [ ] Comportamento idêntico
- [ ] Admin funcionando

### Técnico
- [ ] TypeScript 100%
- [ ] Zero errors/warnings
- [ ] Bundle < 100kb inicial
- [ ] Build sem erros

---

## 🔧 COMANDOS ÚTEIS

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test

# Analyze bundle
npm run analyze
```

---

## 📞 PONTOS DE VALIDAÇÃO

### Após cada fase:
1. Screenshot comparativo
2. Teste funcional completo
3. Performance check
4. Code review
5. Commit atomico

### Antes do deploy:
1. Teste em dispositivos reais
2. Validação com usuário
3. Backup do ambiente atual
4. Deploy em staging primeiro
5. Smoke tests em produção

---

## 🎉 ENTREGA FINAL

### Resultado esperado:
- **Usuário:** Zero diferença visual/funcional
- **Developer:** Código moderno e tipado
- **Performance:** 50-70% mais rápido
- **SEO:** 100% melhor com SSR
- **Manutenção:** Muito mais fácil

### Stack final:
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS 3.4
- Supabase
- Zustand
- React Query
- Vercel Deploy

---

**LEMBRETE FINAL:** Seguir este documento à risca. Qualquer dúvida, consultar antes de implementar. NUNCA inventar melhorias não solicitadas.

Data de início: ___________
Data prevista: ___________
Responsável: Lucas / Claude
Status: 🟡 Em andamento