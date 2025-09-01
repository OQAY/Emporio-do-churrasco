# 🚀 Guia de Deploy - Menu Online

## 📋 Visão Geral

Sistema de cardápio digital pronto para deploy em plataformas de hospedagem estática.

## 🌐 Opções de Deploy

### 🥇 **Opção 1: Netlify (Recomendado)**

**Deploy Automático:**
1. Faça push do código para GitHub
2. Conecte repositório no [Netlify](https://netlify.com)
3. Configure:
   - **Build command**: `npm run build` (ou deixe vazio)
   - **Publish directory**: `.` (raiz do projeto)
4. Deploy automático!

**Deploy Manual:**
1. Build local: `npm run build` (opcional)
2. Arraste a pasta do projeto para Netlify
3. Pronto!

### 🥈 **Opção 2: Vercel**

1. Conecte repositório no [Vercel](https://vercel.com)
2. Deploy automático
3. SSL e CDN incluídos

### 🥉 **Opção 3: GitHub Pages**

1. Ative GitHub Pages no repositório
2. Configure para branch `main` 
3. Acesse via `username.github.io/repo-name`

## ⚙️ Configurações Automáticas

O projeto já inclui:
- ✅ **netlify.toml** - Configurações do Netlify
- ✅ **Redirects** - SPA routing automático  
- ✅ **Headers** - Segurança e performance
- ✅ **Cache** - Otimização de assets

## 🔧 Customização Pós-Deploy

### Domínio Personalizado
1. Configure DNS para apontar para sua plataforma
2. Configure SSL (automático na maioria das plataformas)

### Configurações do Restaurante
1. Acesse `/admin.html` no seu domínio
2. Login: `admin` / `admin123`
3. Configure nome, logo e banner

## 🐛 Troubleshooting

**Problema**: Páginas não carregam
- **Solução**: Verifique se redirects estão configurados para SPA

**Problema**: Admin não funciona
- **Solução**: Verifique se localStorage é suportado no domínio

**Problema**: Imagens não aparecem
- **Solução**: Verifique CORS e paths relativos

## 📞 Suporte

- Documentação completa: `README.md`
- Testes locais: `COMO-TESTAR.md`
- Issues: GitHub Issues do projeto

---

**Deploy simples e direto - sua solução está pronta para produção!** 🎉