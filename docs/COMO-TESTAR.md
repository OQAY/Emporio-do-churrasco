# 🧪 Como Testar o Sistema

## 🚀 Acesso Rápido

### Opção 1: Abertura Direta
1. Abra `index.html` no navegador (cardápio)
2. Abra `admin.html` no navegador (painel admin)

### Opção 2: Servidor Local
```bash
# No terminal, na pasta do projeto:
npx serve . -s -l 3000

# Acesse:
# http://localhost:3000 (cardápio)
# http://localhost:3000/admin (painel admin)
```

## 🔐 Credenciais de Acesso

**Painel Administrativo:**
- **Usuário:** `admin`
- **Senha:** `admin123`

## 📱 Teste do Cardápio Digital

### Funcionalidades do Cliente:
1. **Navegação por Categorias**
   - Clique nas abas de categorias
   - Veja produtos de cada seção

2. **Busca de Produtos**
   - Clique no ícone de busca (🔍)
   - Digite nome do produto
   - Veja resultados em tempo real

3. **Visualização Responsiva**
   - Teste em diferentes tamanhos de tela
   - Mobile, tablet e desktop

## 🛠️ Teste do Painel Admin

### 1. Login
- Acesse `/admin.html`
- Use credenciais: admin/admin123

### 2. Dashboard
- Veja estatísticas dos produtos
- Teste ações rápidas

### 3. Gestão de Produtos
- **Adicionar Produto:**
  - Clique "Adicionar Produto"
  - Preencha formulário
  - Envie uma imagem (opcional)
  - Salve e veja no cardápio

- **Editar Produto:**
  - Clique "Editar" em qualquer produto
  - Modifique dados
  - Salve e veja mudanças

- **Filtros:**
  - Use busca de produtos
  - Filtre por categoria

### 4. Gestão de Categorias
- **Adicionar Categoria:**
  - Clique "Adicionar Categoria"
  - Defina nome e ordem
  - Veja no cardápio

- **Editar Categoria:**
  - Clique ícone editar
  - Modifique nome/ordem
  - Ative/desative

### 5. Configurações
- **Restaurante:**
  - Mude nome, logo, banner
  - Veja mudanças no cardápio

- **Backup:**
  - Exporte dados (JSON)
  - Importe dados de backup

## 🎯 Cenários de Teste

### Cenário 1: Novo Restaurante
1. Acesse admin
2. Vá em Configurações
3. Mude nome para "Seu Restaurante"
4. Adicione nova categoria "Sobremesas"
5. Adicione produto "Pudim" na categoria
6. Veja no cardápio

### Cenário 2: Promoção
1. Edite um produto
2. Marque como "Em destaque"
3. Veja badge no cardápio

### Cenário 3: Gerenciamento
1. Desative um produto
2. Veja que sumiu do cardápio
3. Reative e veja que voltou

## 🔄 Reset de Dados

Para limpar todos os dados:
1. Abra console do navegador (F12)
2. Digite: `localStorage.clear()`
3. Recarregue a página

## 📊 Métricas de Sucesso

✅ **Funcionando Corretamente:**
- Login admin funciona
- Produtos aparecem no cardápio
- Imagens carregam
- Busca funciona
- Categorias navegam
- CRUD completo funciona
- Dados persistem entre sessões

## 🚨 Possíveis Problemas

### Imagens não carregam
- **Causa:** Conexão lenta
- **Solução:** Aguarde ou use imagens menores

### Console com erros
- **Causa:** Módulos ES6 sem servidor
- **Solução:** Use `npx serve` ou ignore se funciona

### Dados perdidos
- **Causa:** localStorage limpo
- **Solução:** Refaça cadastros ou importe backup

### Login não aceita
- **Causa:** Credenciais erradas
- **Solução:** Use exatamente: admin/admin123

## 💡 Dicas Avançadas

### Performance
- Imagens são convertidas em base64
- Limite: ~5MB por imagem
- Prefira JPG otimizadas

### Desenvolvimento
- Código está em `src/js/`
- Styles em `src/styles/`
- Dados em localStorage

### Deploy
- Pronto para Netlify
- Arraste pasta completa
- Configure redirects automaticamente

---

**Sistema 100% funcional e pronto para demonstração!** 🎉