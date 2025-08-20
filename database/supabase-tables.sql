-- SQL para criar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela para usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Em produção, usar hash
    role VARCHAR(20) DEFAULT 'admin',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela para tags de produtos
CREATE TABLE IF NOT EXISTS product_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6b7280', -- Hex color
    icon VARCHAR(10) DEFAULT '🏷️', -- Emoji icon
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(restaurant_id, name) -- Evita tags duplicadas por restaurante
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_restaurant_id ON admin_users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_product_tags_restaurant_id ON product_tags(restaurant_id);

-- 4. Triggers para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_tags_updated_at 
    BEFORE UPDATE ON product_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security) - opcional, para multi-tenant
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- 6. Inserir usuário admin padrão (ajuste o restaurant_id)
INSERT INTO admin_users (restaurant_id, username, password, role) 
VALUES (
    'b639641d-518a-4bb3-a2b5-f7927d6b6186', -- Seu restaurant_id
    'admin', 
    'admin123', -- Em produção, usar hash
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- 7. Algumas tags padrão (opcional)
INSERT INTO product_tags (restaurant_id, name, color, icon) VALUES
('b639641d-518a-4bb3-a2b5-f7927d6b6186', 'Destaque', '#f59e0b', '⭐'),
('b639641d-518a-4bb3-a2b5-f7927d6b6186', 'Novo', '#10b981', '🆕'),
('b639641d-518a-4bb3-a2b5-f7927d6b6186', 'Promoção', '#ef4444', '🔥'),
('b639641d-518a-4bb3-a2b5-f7927d6b6186', 'Vegetariano', '#22c55e', '🥬'),
('b639641d-518a-4bb3-a2b5-f7927d6b6186', 'Picante', '#dc2626', '🌶️')
ON CONFLICT (restaurant_id, name) DO NOTHING;