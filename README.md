# 🍽️ Menu Online - Sistema de Cardápio Digital

Sistema completo de cardápio digital com painel administrativo para restaurantes. Permite gerenciar produtos, categorias e visualizar estatísticas em tempo real.

## ✨ Funcionalidades

### 🔧 Painel Administrativo
- **Dashboard** com estatísticas detalhadas
- **Gestão de Produtos** (CRUD completo)
- **Gestão de Categorias** com ordenação
- **Upload de imagens** via base64
- **Configurações** do restaurante
- **Backup/Restore** de dados
- **Sistema de autenticação** simples

### 📱 Cardápio Digital
- **Interface responsiva** para mobile/tablet/desktop
- **Navegação por categorias** intuitiva
- **Busca em tempo real** de produtos
- **Design moderno** com Tailwind CSS
- **Performance otimizada**

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 14+ (opcional, para desenvolvimento)
- Navegador moderno

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/usuario/menu-online.git
cd menu-online

# Instale dependências (opcional)
npm install

# Execute localmente
npm run dev
# ou simplesmente abra index.html no navegador
```

### Acesso ao Sistema
- **Cardápio**: `index.html` ou `/`
- **Admin**: `admin.html` ou `/admin`
- **Credenciais padrão**: 
  - Usuário: `admin`
  - Senha: `admin123`

## 📁 Estrutura do Projeto

```
Menu-Online/
├── index.html              # Cardápio principal
├── admin.html              # Painel administrativo
├── package.json            # Configurações do projeto
├── netlify.toml           # Configurações do Netlify
├── .gitignore             # Arquivos ignorados pelo Git
├── README.md              # Documentação
├── ROADMAP-PROTOTIPO.claude    # Roadmap do MVP
├── ROADMAP-COMPLETO.claude     # Roadmap do SaaS
├── src/
│   ├── js/
│   │   ├── app.js              # App principal
│   │   ├── admin.js            # App administrativo
│   │   ├── database.js         # Sistema de dados local
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── AdminController.js
│   │   │   └── ProductController.js
│   │   └── views/
│   │       ├── MenuView.js
│   │       └── AdminView.js
│   └── styles/
│       ├── main.css            # Estilos do cardápio
│       └── admin.css           # Estilos do admin
├── images/
│   ├── produtos/              # Imagens dos produtos
│   └── banners/              # Banners do restaurante
└── public/                   # Assets públicos
```

## 🔧 Configuração

### Personalizar Restaurante
1. Acesse o painel admin: `/admin.html`
2. Vá em **Configurações**
3. Altere nome, logo e banner
4. Salve as alterações

### Gerenciar Produtos
1. No painel admin, vá em **Produtos**
2. Clique em **Adicionar Produto**
3. Preencha os dados e envie uma imagem
4. Configure status (ativo/destaque)

### Gerenciar Categorias
1. No painel admin, vá em **Categorias**
2. Adicione/edite categorias
3. Configure ordem de exibição
4. Ative/desative conforme necessário

## 🚀 Deploy no Netlify

### Deploy Automático via Git
1. Faça push do código para GitHub
2. Conecte o repositório no Netlify
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.`
4. Deploy automático!

### Deploy Manual
1. Faça build local: `npm run build`
2. Arraste a pasta do projeto para Netlify
3. Configurações aplicadas automaticamente

### Configurações do Netlify
O arquivo `netlify.toml` já está configurado com:
- Redirects para SPA
- Headers de segurança
- Cache otimizado
- Suporte a admin routes

## 💾 Armazenamento de Dados

O sistema usa **localStorage** para persistir dados:
- Produtos e categorias
- Configurações do restaurante
- Credenciais de login

### Backup Manual
1. No painel admin, vá em **Configurações**
2. Clique em **Exportar Dados**
3. Salve o arquivo JSON

### Restaurar Backup
1. No painel admin, vá em **Configurações**
2. Selecione arquivo de backup
3. Clique em **Importar Dados**

## 🔒 Segurança

### Autenticação
- Sessão expira em 4 horas
- Senha armazenada localmente
- Proteção contra acesso não autorizado

### Headers de Segurança
- X-Frame-Options: DENY
- X-XSS-Protection
- X-Content-Type-Options
- CSP headers via Netlify

## 🎨 Personalização

### Cores e Tema
Edite as variáveis CSS em `src/styles/main.css`:
```css
:root {
    --primary-color: #fb923c;
    --secondary-color: #f97316;
}
```

### Layout
- Framework: **Tailwind CSS** (via CDN)
- Responsivo por padrão
- Componentes modulares

## 📊 Performance

### Otimizações Implementadas
- Lazy loading de imagens
- Cache de assets via Netlify
- Código modular ES6+
- Compressão automática

### Métricas Esperadas
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s

## 🛠️ Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev      # Servidor local (porta 3000)
npm run build    # Build para produção
npm run preview  # Preview do build (porta 4173)
npm run lint     # Verificar código
npm run format   # Formatar código
```

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework CSS**: Tailwind CSS
- **Arquitetura**: MVC modular
- **Storage**: localStorage API
- **Deploy**: Netlify

## 🎯 Roadmap

### MVP (3 semanas) ✅
- [x] Sistema de produtos e categorias
- [x] Painel administrativo completo
- [x] Interface responsiva
- [x] Deploy no Netlify

### Próximas Funcionalidades
- [ ] Sistema de pedidos
- [ ] Carrinho de compras
- [ ] Notificações push
- [ ] Modo offline (PWA)
- [ ] Multi-idiomas
- [ ] Analytics básico

### SaaS Completo (6+ meses)
Ver arquivo `ROADMAP-COMPLETO.claude` para detalhes.

## 🐛 Problemas Conhecidos

### Limitações do localStorage
- Máximo ~5-10MB por domínio
- Dados perdidos se limpar navegador
- Sem sincronização entre dispositivos

### Soluções Futuras
- Migração para backend real
- Base de dados externa
- Sincronização em nuvem

## 📞 Suporte

### Problemas Comuns

**Login não funciona**
- Verifique credenciais: admin/admin123
- Limpe cache do navegador
- Tente modo anônimo

**Imagens não carregam**
- Verifique tamanho (máx 5MB)
- Use formatos: JPG, PNG, WebP
- Tente reenviar a imagem

**Dados perdidos**
- Faça backup regular em Configurações
- Evite limpar dados do navegador
- Use versão mais recente

### Contato
- **GitHub**: [Issues](https://github.com/usuario/menu-online/issues)
- **Email**: suporte@exemplo.com

## 📜 Licença

MIT License - veja arquivo `LICENSE` para detalhes.

---

**Desenvolvido com ❤️ para revolucionar a experiência gastronômica digital**