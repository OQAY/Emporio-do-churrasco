# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

**Empório do Churrasco** - Sistema de Cardápio Digital com Painel Administrativo
- **Tipo**: Menu digital para restaurante
- **Arquitetura**: JavaScript vanilla com módulos ES6+ seguindo padrão MVC
- **Linguagem**: Português brasileiro (pt-BR)
- **Armazenamento**: Abordagem híbrida usando localStorage + sincronização Supabase
- **Deploy**: Site estático otimizado para Netlify

## Comandos de Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev      # Roda live-server na porta 8080
npm start        # Mesmo que dev

# Build (não precisa - site estático)
npm run build    # Retorna: "Static site - no build needed"

# Pontos de acesso
# Menu do cliente: http://localhost:8080/index.html
# Painel admin: http://localhost:8080/admin.html
# Credenciais padrão: admin / admin123
```

## Arquitetura e Organização do Código

### Pontos de Entrada Principais
- **index.html** - Interface do cardápio para clientes
- **admin.html** - Painel administrativo para gerenciamento

### Estrutura de Módulos
```
src/js/
├── app.js                    # Inicialização do app cliente
├── admin.js                  # Inicialização do painel admin
├── database.js               # Classe base de dados localStorage
├── database-nasa.js          # Database com monitoramento
├── database-supabase.js      # Integração Supabase
├── controllers/
│   ├── AdminController.js   # Lógica do painel admin
│   ├── AuthController.js    # Autenticação
│   └── ProductController.js  # Gerenciamento de produtos
├── views/
│   ├── MenuView.js          # Renderização do menu
│   └── AdminView.js         # Renderização do admin
├── core/
│   ├── EnterpriseCore.js   # Padrões avançados
│   └── SecuritySystem.js    # Camada de segurança
├── services/
│   └── SupabaseService.js  # Serviço de sincronização
└── performance/
    └── PerformanceMonitor.js # Monitoramento de performance
```

## Padrões de Código Pragmáticos

### Limites Razoáveis
- **Arquivos**: até 500-800 linhas (dividir se ficar confuso)
- **Funções**: até 50-80 linhas (menos é melhor, mas seja prático)
- **Classes**: até 300-400 linhas
- **Complexidade**: manter simples e legível

### Quando Modularizar
- Quando o arquivo ficar difícil de navegar
- Quando houver clara separação de responsabilidades
- Quando o código for reutilizado 3+ vezes
- NÃO modularize prematuramente

### Nomenclatura
- **Arquivos**: kebab-case (ex: `database-supabase.js`)
- **Classes**: PascalCase (ex: `AdminController`)
- **Funções**: camelCase (ex: `loadProducts()`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_RETRIES`)
- Use nomes descritivos mas não exagerados

## Gerenciamento de Dados

### Chaves do localStorage
- `restaurante_config` - Configurações do restaurante (nome, logo, banner)
- `menu_produtos` - Dados dos produtos
- `menu_categorias` - Dados das categorias
- `admin_user` - Autenticação do admin
- `performance_metrics` - Dados de monitoramento

### Fluxo de Dados
1. Ações do usuário disparam métodos dos controllers
2. Controllers validam e processam dados
3. Classes de database persistem (localStorage + Supabase)
4. Views atualizam UI baseado nas mudanças
5. Sincronização em background com Supabase quando online

## Tratamento de Erros

```javascript
// Abordagem pragmática - simples e funcional
try {
  await operacaoRiscos();
} catch (error) {
  console.error('Operação falhou:', error);
  // Notificar usuário ou retornar valor padrão
}
```

## Segurança Básica

### Sempre Implementar
- Validação de inputs do usuário
- Escape de outputs (prevenção XSS)
- Não armazenar secrets no código

### Autenticação Simples
- Auth baseada em localStorage
- Sessão expira em 4 horas
- Credenciais padrão: admin/admin123

## Performance

### Otimizações Implementadas
- Lazy loading de imagens
- Carregamento progressivo de dados
- Service worker para funcionar offline
- Busca com debounce
- Circuit breaker para APIs

### Pragmatismo
- Código que funciona primeiro, otimizar depois
- Performance "boa o suficiente" é OK
- Não over-engineer

## Testes - Abordagem Prática

### Quando Testar
- Lógica de negócio crítica
- Funções com múltiplas condições
- Correção de bugs (regression tests)

### Não Precisa Testar
- Componentes simples de UI
- Protótipos/POCs
- Código que vai mudar em breve

## Deploy e Configuração

### Netlify (netlify.toml)
- Redirects para SPA configurados
- Headers de segurança básicos
- Cache otimizado
- HTTPS automático

### Variáveis de Ambiente
Nenhuma obrigatória. Para Supabase (opcional):
- `SUPABASE_URL` - URL do projeto
- `SUPABASE_ANON_KEY` - Chave anônima

## Tarefas Comuns de Desenvolvimento

### Adicionar Nova Feature de Produto
1. Atualizar modelo em `database.js` se necessário
2. Adicionar lógica em `ProductController.js`
3. Atualizar renderização em `MenuView.js` ou `AdminView.js`
4. Testar persistência no localStorage
5. Verificar sync do Supabase se habilitado

### Modificar Painel Admin
1. Mudanças em `admin.js` e `AdminView.js`
2. Seguir padrões existentes de modais/forms
3. Garantir validação e tratamento de erros
4. Testar com diferentes cenários

### Atualizar Estilos
- Estilos do cliente: `src/styles/main.css`
- Estilos do admin: `src/styles/admin.css`
- Tailwind CSS via CDN para utilities
- Mobile-first sempre

## Verificação Antes de "Pronto"

### Essencial
- Código roda sem erros
- Funcionalidade principal funciona
- Não quebrou nada existente

### Não Precisa
- 100% perfeito
- Todos edge cases cobertos
- Performance máxima otimizada

## Resolução de Problemas

### Produtos não aparecem
- Verificar localStorage: `localStorage.getItem('menu_produtos')`
- Categorias estão ativas?
- Checar console por erros

### Login admin falha
- Limpar localStorage e tentar credenciais padrão
- Verificar se localStorage está habilitado
- Tentar modo incógnito

### Imagens não carregam
- Verificar encoding base64
- Tamanho < 5MB recomendado
- MIME type correto no data URL

### Sync Supabase não funciona
- Verificar conexão internet
- Checar credenciais se configurado
- Ver erros no console
- Sistema funciona sem Supabase (só localStorage)

## Filosofia do Projeto

**Seja pragmático, não perfeccionista.**

Entregue código que:
1. Funciona
2. É razoavelmente limpo
3. Pode ser mantido
4. Resolve o problema do usuário

Evite:
- Over-engineering
- Abstração prematura
- Perfeição desnecessária
- Regras arbitrárias

**O melhor código é o que entrega valor.**