-- Schema do banco de dados para o sistema de cardápio digital multi-tenant

-- Tabela de restaurantes (cada cliente)
CREATE TABLE restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subdomain TEXT UNIQUE NOT NULL, -- ex: "pizzaria-bella"
    custom_domain TEXT UNIQUE, -- ex: "pizzariabella.com.br" (opcional)
    name TEXT NOT NULL,
    logo TEXT, -- URL ou base64
    banner TEXT, -- URL da imagem de capa
    theme JSONB DEFAULT '{"primaryColor": "#fb923c", "secondaryColor": "#f97316"}',
    settings JSONB DEFAULT '{}', -- configurações extras
    plan TEXT DEFAULT 'basic', -- basic, premium, enterprise
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de usuários administrativos
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- usar bcrypt
    role TEXT DEFAULT 'admin', -- admin, manager, viewer
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela de categorias
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(restaurant_id, name)
);

-- Tabela de produtos
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- para promoções
    is_on_sale BOOLEAN DEFAULT false,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}', -- array de tags
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de imagens da galeria
CREATE TABLE gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size INTEGER,
    type TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de tags de produtos
CREATE TABLE product_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',
    icon TEXT DEFAULT '🏷️',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(restaurant_id, slug)
);

-- Índices para performance
CREATE INDEX idx_restaurants_subdomain ON restaurants(subdomain);
CREATE INDEX idx_restaurants_custom_domain ON restaurants(custom_domain);
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_active ON products(active) WHERE active = true;

-- Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (exemplo para produtos)
-- Leitura pública para produtos ativos
CREATE POLICY "Produtos públicos podem ser lidos" ON products
    FOR SELECT USING (active = true);

-- Admin pode fazer tudo com produtos do seu restaurante
CREATE POLICY "Admin gerencia produtos do seu restaurante" ON products
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM admin_users 
            WHERE restaurant_id = products.restaurant_id
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();