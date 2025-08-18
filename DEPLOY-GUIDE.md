# Guia de Deploy - Cardápio Digital Multi-tenant

## Visão Geral da Arquitetura

Sistema de cardápio digital profissional com:
- **Multi-tenant**: Um sistema atende múltiplos restaurantes
- **Banco de dados**: Supabase (PostgreSQL + Storage + Auth)
- **Frontend**: HTML/JS/CSS (migrável para Next.js)
- **Deploy**: Vercel (frontend) + Supabase (backend)
- **Domínios**: Subdomínios gratuitos ou domínios customizados

## Passo 1: Configurar Supabase

### 1.1 Criar Conta e Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie conta gratuita
3. Criar novo projeto:
   - Nome: `cardapio-digital`
   - Senha do banco: (anote em local seguro)
   - Região: São Paulo (sa-east-1)

### 1.2 Configurar Banco de Dados
1. Abra o SQL Editor no Supabase
2. Cole e execute o conteúdo de `supabase-schema.sql`
3. Verificar se as tabelas foram criadas em Table Editor

### 1.3 Configurar Storage
1. Vá em Storage → New Bucket
2. Nome: `products`
3. Public bucket: ✅ (marcar)
4. Configurar políticas:
```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Leitura pública
CREATE POLICY "Public can view" ON storage.objects
FOR SELECT USING (bucket_id = 'products');
```

### 1.4 Anotar Credenciais
Em Settings → API, copie:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGci...`

## Passo 2: Deploy no Vercel

### 2.1 Preparar Repositório
```bash
# Criar arquivo de variáveis de ambiente
echo "SUPABASE_URL=sua_url_aqui" > .env.local
echo "SUPABASE_ANON_KEY=sua_chave_aqui" >> .env.local

# Adicionar ao .gitignore
echo ".env.local" >> .gitignore

# Commit
git add .
git commit -m "Adicionar configuração Supabase"
git push origin main
```

### 2.2 Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Importar projeto do GitHub
3. Configurar variáveis de ambiente:
   - `SUPABASE_URL`: (sua URL)
   - `SUPABASE_ANON_KEY`: (sua chave)
4. Deploy!

### 2.3 Configurar Domínio Principal
No Vercel, adicione domínio:
- `seucardapio.com.br` (comprar no Registro.br)
- Vercel fornece SSL automático

## Passo 3: Configurar Multi-tenant

### 3.1 Estratégia de Subdomínios

**Opção 1: Subdomínios Gratuitos**
```
restaurante1.seucardapio.com.br
restaurante2.seucardapio.com.br
```

No Vercel:
1. Settings → Domains
2. Add: `*.seucardapio.com.br` (wildcard)
3. Sistema detecta automaticamente o subdomínio

**Opção 2: Domínios Customizados (Premium)**
Cliente compra: `pizzariabella.com.br`

Configuração DNS no registrador do cliente:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3.2 Criar Primeiro Restaurante

No Supabase SQL Editor:
```sql
-- Inserir restaurante de exemplo
INSERT INTO restaurants (subdomain, name, logo, active)
VALUES ('demo', 'Restaurante Demo', 'RD', true);

-- Pegar o ID gerado
SELECT id FROM restaurants WHERE subdomain = 'demo';

-- Inserir usuário admin (substitua restaurant_id)
INSERT INTO admin_users (restaurant_id, email, password_hash, role)
VALUES ('id-do-restaurante', 'admin@demo.com', 'hash_aqui', 'admin');
```

## Passo 4: Modelo de Negócio

### 4.1 Estrutura de Custos

**Custos Fixos Mensais:**
- Domínio principal: ~R$ 30/ano (R$ 2,50/mês)
- Vercel Pro (opcional): $20/mês
- Supabase (free tier): R$ 0
  - Até 500MB database
  - Até 1GB storage
  - 50.000 requisições/mês

**Por Cliente:**
- Subdomínio: R$ 0
- Domínio próprio: ~R$ 350/ano (repassar ao cliente)

### 4.2 Precificação Sugerida

**Plano Básico - R$ 49/mês**
- Subdomínio gratuito
- 100 produtos
- 10 categorias
- Suporte por email

**Plano Profissional - R$ 99/mês**
- Domínio próprio (cliente paga registro)
- Produtos ilimitados
- Categorias ilimitadas
- Suporte prioritário
- Relatórios

**Plano Premium - R$ 199/mês**
- Tudo do Profissional
- Sistema de pedidos
- Integração WhatsApp
- App mobile (PWA)

### 4.3 Automação de Cobrança

Integrar com:
- **Stripe** ou **PagSeguro** para cobranças recorrentes
- Webhook para ativar/desativar restaurantes automaticamente

## Passo 5: Migração de Dados

### 5.1 Do localStorage para Supabase

1. Acessar: `/admin-supabase.html`
2. Inserir credenciais do Supabase
3. Clicar "Migrar para Supabase"
4. Verificar dados no Supabase Dashboard

### 5.2 Backup e Restore

**Backup Manual:**
```sql
-- No Supabase SQL Editor
SELECT * FROM products WHERE restaurant_id = 'xxx';
-- Exportar como CSV
```

**Backup Automático:**
Supabase faz backup diário automático no plano Pro

## Passo 6: Monitoramento

### 6.1 Analytics
- Vercel Analytics (básico incluído)
- Google Analytics (adicionar script)
- Supabase Dashboard (métricas de uso)

### 6.2 Logs e Erros
```javascript
// Adicionar no supabase-client.js
window.addEventListener('error', (e) => {
    // Enviar para serviço de logs
    console.error('Erro capturado:', e);
});
```

## Passo 7: Escalonamento

### Quando Escalar:

**Supabase Free → Pro ($25/mês)**
- Mais de 500MB de dados
- Mais de 50k requisições/mês
- Precisa de backup Point-in-Time

**Vercel Hobby → Pro ($20/mês)**
- Domínios ilimitados
- Analytics avançado
- Suporte prioritário

### Otimizações de Performance:

1. **Cache de Imagens**
```javascript
// Usar CDN para imagens
const imageUrl = `https://cdn.supabase.co/storage/v1/object/public/products/${image}`;
```

2. **Lazy Loading**
```html
<img loading="lazy" src="produto.jpg">
```

3. **Minificar Assets**
```bash
npm install -D terser
npx terser src/js/app.js -o dist/app.min.js
```

## Troubleshooting

### Problema: "Dados não sincronizam"
**Solução:**
1. Verificar credenciais Supabase
2. Verificar RLS policies
3. Console do navegador para erros

### Problema: "Subdomínio não funciona"
**Solução:**
1. Verificar wildcard DNS no Vercel
2. Aguardar propagação DNS (até 48h)
3. Testar com `nslookup subdomain.site.com`

### Problema: "Upload de imagem falha"
**Solução:**
1. Verificar tamanho (máx 5MB free tier)
2. Verificar Storage policies
3. Verificar CORS no Supabase

## Scripts Úteis

### Reset de Senha Admin
```sql
-- No Supabase SQL Editor
UPDATE admin_users 
SET password_hash = 'novo_hash_aqui'
WHERE email = 'admin@restaurante.com';
```

### Estatísticas do Sistema
```sql
-- Quantidade de restaurantes
SELECT COUNT(*) as total_restaurants FROM restaurants;

-- Produtos por restaurante
SELECT r.name, COUNT(p.id) as total_products
FROM restaurants r
LEFT JOIN products p ON r.id = p.restaurant_id
GROUP BY r.id, r.name
ORDER BY total_products DESC;
```

### Limpeza de Dados
```sql
-- Remover produtos inativos com mais de 6 meses
DELETE FROM products 
WHERE active = false 
AND updated_at < NOW() - INTERVAL '6 months';
```

## Checklist de Lançamento

- [ ] Supabase configurado e testado
- [ ] Deploy no Vercel funcionando
- [ ] Domínio principal configurado
- [ ] SSL ativo (automático)
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação para clientes
- [ ] Sistema de cobrança integrado
- [ ] Termos de uso e privacidade
- [ ] Suporte configurado (email/WhatsApp)

## Contato e Suporte

Para dúvidas sobre o deploy:
- Documentação Supabase: [supabase.com/docs](https://supabase.com/docs)
- Documentação Vercel: [vercel.com/docs](https://vercel.com/docs)
- Issues do projeto: GitHub Issues

---

**Desenvolvido para escalar de 1 para 1000+ restaurantes com mínima manutenção**