# 🛠️ Debug Tools

Esta pasta contém ferramentas de debug e teste para o Menu-Online.

## 📋 Arquivos de Debug

### 🧪 Testes Principais
- **`test-upload-gallery.html`** - Interface completa para testar upload de imagens na galeria
- **`debug-console.js`** - Script para executar no console do navegador

### 🔍 Debug Específico
- **`debug-admin-error.html`** - Debug de erros do painel admin
- **`debug-supabase.html`** - Debug da integração Supabase

### 📁 Arquivos Temporários
- **`temp-*.html`** - Versões temporárias de arquivos
- **`temp-*.js`** - Scripts temporários
- **`test-*.html`** - Páginas de teste específicas
- **`test-*.js`** - Scripts de teste

## 🚀 Como Usar

### Para testar upload de imagens:
1. Inicie o servidor: `python -m http.server 8080`
2. Acesse: `http://localhost:8080/debug/test-upload-gallery.html`
3. Clique nos botões na ordem:
   - 🔑 Test Authentication
   - 📊 Test Load Data
   - 📸 Test Gallery Images
   - 📤 Test Image Upload

### Para debug via console:
1. Acesse `http://localhost:8080/admin.html`
2. Abra o console (F12)
3. Execute o conteúdo de `debug-console.js`

## 📊 Status dos Testes

| Funcionalidade | Status | Descrição |
|---|---|---|
| Authentication | ✅ | Login admin funcional |
| Load Data | ✅ | Carregamento Supabase OK |
| Gallery Display | ✅ | Exibição da galeria |
| Image Upload | 🔄 | Em teste/debug |

## 🐛 Problemas Conhecidos

- Upload de imagens pode não persistir no Supabase
- Cache pode não ser atualizado após upload
- Gallery pode não atualizar automaticamente

## 🔧 Limpeza

Para limpar arquivos temporários:
```bash
rm debug/temp-*
rm debug/test-*
```