// Script para criar novos restaurantes facilmente
const SUPABASE_URL = 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';

async function createNewRestaurant(restaurantData) {
    console.log(`🏪 Criando restaurante: ${restaurantData.name}`);
    
    try {
        // 1. Criar restaurante
        const restaurantResponse = await fetch(`${SUPABASE_URL}/rest/v1/restaurants`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                subdomain: restaurantData.subdomain,
                name: restaurantData.name,
                logo: restaurantData.logo || restaurantData.name.substring(0, 2).toUpperCase(),
                banner: restaurantData.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                active: true,
                plan: restaurantData.plan || 'basic'
            })
        });
        
        if (!restaurantResponse.ok) {
            throw new Error(`Erro ao criar restaurante: ${await restaurantResponse.text()}`);
        }
        
        const restaurant = await restaurantResponse.json();
        const restaurantId = restaurant[0].id;
        
        console.log(`✅ Restaurante criado com ID: ${restaurantId}`);
        
        // 2. Criar categorias padrão
        const defaultCategories = [
            'Entradas',
            'Pratos Principais', 
            'Bebidas',
            'Sobremesas'
        ];
        
        const categoryIds = [];
        
        for (let i = 0; i < defaultCategories.length; i++) {
            const categoryResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    name: defaultCategories[i],
                    display_order: i + 1,
                    active: true
                })
            });
            
            if (categoryResponse.ok) {
                const category = await categoryResponse.json();
                categoryIds.push(category[0].id);
                console.log(`✅ Categoria "${defaultCategories[i]}" criada`);
            }
        }
        
        // 3. Criar produto demo
        if (categoryIds.length > 0) {
            const demoProductResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    category_id: categoryIds[0],
                    name: 'Produto Demo',
                    description: 'Este é um produto de demonstração. Edite ou remova via painel admin.',
                    price: 10.00,
                    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
                    active: true,
                    featured: false,
                    display_order: 1
                })
            });
            
            if (demoProductResponse.ok) {
                console.log(`✅ Produto demo criado`);
            }
        }
        
        // 4. Verificar dados criados
        console.log('\n' + '='.repeat(50));
        console.log(`🎉 RESTAURANTE "${restaurantData.name}" CRIADO!`);
        console.log('='.repeat(50));
        console.log(`🆔 ID: ${restaurantId}`);
        console.log(`🌐 Subdomínio: ${restaurantData.subdomain}.seucardapio.com.br`);
        console.log(`📂 Categorias: ${categoryIds.length}`);
        console.log(`🍕 Produtos: 1 (demo)`);
        console.log(`🔗 Admin: http://localhost:8080/admin.html?restaurant=${restaurantId}`);
        console.log('='.repeat(50));
        
        return {
            success: true,
            restaurant: restaurant[0],
            categories: categoryIds.length,
            subdomain: `${restaurantData.subdomain}.seucardapio.com.br`
        };
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return { success: false, error: error.message };
    }
}

// Exemplos de uso:
async function createExampleRestaurants() {
    console.log('🚀 Criando restaurantes de exemplo...\n');
    
    // Restaurante 1: Pizzaria
    await createNewRestaurant({
        subdomain: 'pizzaria-bella',
        name: 'Pizzaria Bella',
        logo: 'PB',
        plan: 'basic'
    });
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Restaurante 2: Burger
    await createNewRestaurant({
        subdomain: 'burger-king-lucas',
        name: 'Burger King Lucas',
        logo: 'BK',
        plan: 'premium'
    });
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Restaurante 3: Sushi
    await createNewRestaurant({
        subdomain: 'sushi-yamato',
        name: 'Sushi Yamato',
        logo: 'SY',
        plan: 'basic'
    });
}

// Função para listar todos os restaurantes
async function listAllRestaurants() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const restaurants = await response.json();
        
        console.log('\n📊 RESTAURANTES CADASTRADOS:');
        console.log('='.repeat(80));
        
        restaurants.forEach((restaurant, index) => {
            console.log(`${index + 1}. ${restaurant.name}`);
            console.log(`   🆔 ID: ${restaurant.id}`);
            console.log(`   🌐 Subdomínio: ${restaurant.subdomain}`);
            console.log(`   🎨 Plano: ${restaurant.plan}`);
            console.log(`   📅 Criado: ${new Date(restaurant.created_at).toLocaleDateString('pt-BR')}`);
            console.log('   ' + '-'.repeat(70));
        });
        
        console.log(`\n📈 Total: ${restaurants.length} restaurantes`);
        
    } catch (error) {
        console.error('❌ Erro ao listar restaurantes:', error);
    }
}

// Função para verificar dados de um restaurante específico
async function checkRestaurantData(restaurantId) {
    try {
        // Buscar categorias
        const categoriesResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?restaurant_id=eq.${restaurantId}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        // Buscar produtos
        const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${restaurantId}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const categories = await categoriesResponse.json();
        const products = await productsResponse.json();
        
        console.log(`\n📊 DADOS DO RESTAURANTE ${restaurantId}:`);
        console.log(`📂 Categorias: ${categories.length}`);
        console.log(`🍕 Produtos: ${products.length}`);
        
        categories.forEach(cat => {
            const catProducts = products.filter(p => p.category_id === cat.id);
            console.log(`   📁 ${cat.name}: ${catProducts.length} produtos`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
    }
}

// Exportar funções
if (typeof module !== 'undefined') {
    module.exports = {
        createNewRestaurant,
        createExampleRestaurants,
        listAllRestaurants,
        checkRestaurantData
    };
}

// Se executado diretamente, criar exemplos
if (require.main === module) {
    // Descomente a linha abaixo para criar restaurantes de exemplo
    // createExampleRestaurants();
    
    // Ou liste os existentes
    listAllRestaurants();
}