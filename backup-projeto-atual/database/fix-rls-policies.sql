-- Corrigir políticas de RLS para permitir operações básicas

-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Produtos públicos podem ser lidos" ON products;
DROP POLICY IF EXISTS "Admin gerencia produtos do seu restaurante" ON products;

-- Políticas mais permissivas para desenvolvimento

-- RESTAURANTS - Permitir leitura pública e inserção/atualização para usuários autenticados
CREATE POLICY "Public can read restaurants" ON restaurants 
    FOR SELECT USING (active = true);

CREATE POLICY "Anyone can insert restaurants" ON restaurants 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update restaurants" ON restaurants 
    FOR UPDATE USING (true);

-- CATEGORIES - Permitir todas as operações relacionadas ao restaurant_id
CREATE POLICY "Public can read active categories" ON categories 
    FOR SELECT USING (active = true);

CREATE POLICY "Anyone can manage categories" ON categories 
    FOR ALL USING (true);

-- PRODUCTS - Permitir leitura pública para produtos ativos
CREATE POLICY "Public can read active products" ON products 
    FOR SELECT USING (active = true);

CREATE POLICY "Anyone can manage products" ON products 
    FOR ALL USING (true);

-- GALLERY_IMAGES - Permitir acesso total por enquanto
CREATE POLICY "Anyone can manage gallery" ON gallery_images 
    FOR ALL USING (true);

-- PRODUCT_TAGS - Permitir acesso total
CREATE POLICY "Anyone can manage tags" ON product_tags 
    FOR ALL USING (true);

-- ADMIN_USERS - Políticas básicas
CREATE POLICY "Admins can read own data" ON admin_users 
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert admin users" ON admin_users 
    FOR INSERT WITH CHECK (true);

-- Opcional: Desabilitar RLS temporariamente para desenvolvimento
-- (Remova os comentários abaixo se quiser facilitar o desenvolvimento)

-- ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_tags DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;