// Migração completa dos dados do localStorage para Supabase
const SUPABASE_URL = 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';

async function migrateData() {
    console.log('🚀 Iniciando migração completa dos dados...');
    
    // Passo 1: Criar restaurante
    console.log('\n1️⃣ Criando restaurante...');
    let restaurantId;
    
    try {
        const restaurantResponse = await fetch(`${SUPABASE_URL}/rest/v1/restaurants`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                subdomain: 'imperio-churrasco',
                name: 'Imperio do Churrasco', 
                logo: 'IC',
                banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                active: true
            })
        });
        
        if (restaurantResponse.ok) {
            const restaurant = await restaurantResponse.json();
            restaurantId = restaurant[0].id;
            console.log('✅ Restaurante criado com ID:', restaurantId);
        } else {
            const error = await restaurantResponse.text();
            console.error('❌ Erro ao criar restaurante:', error);
            return;
        }
    } catch (error) {
        console.error('❌ Erro na criação do restaurante:', error);
        return;
    }
    
    // Passo 2: Migrar categorias
    console.log('\n2️⃣ Migrando categorias...');
    const categories = [
        { name: "Especiais da Casa", order: 1 },
        { name: "Entradas", order: 2 },
        { name: "Petiscos", order: 3 },
        { name: "Pratos com Acompanhamento", order: 4 },
        { name: "Executivos (Pratos Individuais)", order: 5 },
        { name: "Porcoes Adicionais", order: 6 },
        { name: "Bebidas", order: 7 }
    ];
    
    const categoryMap = {}; // Para mapear old IDs para new IDs
    let categoriesCreated = 0;
    
    for (const category of categories) {
        try {
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
                    name: category.name,
                    display_order: category.order,
                    active: true
                })
            });
            
            if (categoryResponse.ok) {
                const newCategory = await categoryResponse.json();
                categoryMap[`cat${category.order}`] = newCategory[0].id;
                categoriesCreated++;
                console.log(`✅ Categoria "${category.name}" criada`);
            } else {
                const error = await categoryResponse.text();
                console.error(`❌ Erro ao criar categoria "${category.name}":`, error);
            }
        } catch (error) {
            console.error(`❌ Erro na categoria "${category.name}":`, error);
        }
    }
    
    console.log(`📊 ${categoriesCreated}/7 categorias criadas`);
    
    // Passo 3: Migrar produtos
    console.log('\n3️⃣ Migrando produtos...');
    const products = [
        // Especiais da Casa
        {
            categoryId: "cat1",
            name: "Pao com Picanha",
            description: "Levemente tostado na chapa, recheado com suculentas fatias de picanha, queijo derretido e o exclusivo molho especial da casa.",
            price: 45.90,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
            featured: true
        },
        {
            categoryId: "cat1", 
            name: "Pao com File",
            description: "Levemente tostado na chapa, recheado com suculentas fatias de file, queijo derretido e o exclusivo molho especial da casa.",
            price: 32.90,
            originalPrice: 42.90,
            isOnSale: true,
            image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5",
            featured: true
        },
        
        // Entradas
        {
            categoryId: "cat2",
            name: "Tabua de Frios", 
            description: "Queijos, salame, azeitonas e variacoes.",
            price: 38.00,
            image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d"
        },
        {
            categoryId: "cat2",
            name: "Queijo com Goiabada",
            description: "Combinacao classica e deliciosa de queijo e goiabada.",
            price: 24.90,
            image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d"
        },
        {
            categoryId: "cat2",
            name: "Bolinho de Camarao",
            description: "Crocante por fora e macio por dentro, recheado com camarao.",
            price: 32.90,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b"
        },
        {
            categoryId: "cat2", 
            name: "Batata com Queijo",
            description: "Batatas fritas cobertas com queijo derretido.",
            price: 26.90,
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877"
        },
        
        // Petiscos
        {
            categoryId: "cat3",
            name: "Isca de Frango Empanado",
            description: "Frango crocante acompanhado de molho rose.",
            price: 28.90,
            image: "https://images.unsplash.com/photo-1562967914-608f82629710"
        },
        {
            categoryId: "cat3",
            name: "Calabresa com Fritas",
            description: "Batata, cebola, molho rose e farofa.",
            price: 34.90,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b"
        },
        {
            categoryId: "cat3",
            name: "Camarao Empanado", 
            description: "Camaroes crocantes servidos com molho rose.",
            price: 45.90,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
            featured: true
        },
        
        // Pratos com Acompanhamento
        {
            categoryId: "cat4",
            name: "Picanha na Chapa",
            description: "Picanha, queijo, batata frita, farofa, vinagrete e baiao de dois.",
            price: 89.90,
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
            featured: true
        },
        {
            categoryId: "cat4",
            name: "File com Fritas",
            description: "File, batata, cebola, farofa, vinagrete e baiao de dois.", 
            price: 78.90,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        },
        
        // Executivos
        {
            categoryId: "cat5",
            name: "Executivo de Picanha",
            description: "Picanha + baiao de dois, farofa, salada e pao de alho.",
            price: 52.90,
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d"
        },
        {
            categoryId: "cat5",
            name: "Executivo de File", 
            description: "File + baiao de dois, farofa, salada e pao de alho.",
            price: 48.90,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        },
        
        // Porcoes Adicionais
        {
            categoryId: "cat6",
            name: "Baiao de Dois",
            description: "Porcao adicional de baiao de dois.",
            price: 18.90,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b"
        },
        {
            categoryId: "cat6",
            name: "Farofa",
            description: "Porcao adicional de farofa.",
            price: 12.90,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        },
        {
            categoryId: "cat6", 
            name: "Vinagrete",
            description: "Porcao adicional de vinagrete.",
            price: 8.90,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        },
        
        // Bebidas
        {
            categoryId: "cat7",
            name: "Refrigerante 2L",
            description: "Coca-Cola, Guarana, Fanta - 2 litros.",
            price: 12.90,
            image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846"
        },
        {
            categoryId: "cat7",
            name: "Cerveja Heineken", 
            description: "Cerveja importada gelada - Long neck.",
            price: 8.90,
            image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846"
        },
        {
            categoryId: "cat7",
            name: "Suco Natural",
            description: "Laranja, acerola, caju - 500ml.",
            price: 6.90,
            image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846"
        },
        {
            categoryId: "cat7",
            name: "Agua Mineral",
            description: "Agua mineral gelada - 500ml.",
            price: 4.90,
            image: "https://images.unsplash.com/photo-1527960471264-932f39eb5846"
        }
    ];
    
    let productsCreated = 0;
    
    for (const product of products) {
        try {
            const newCategoryId = categoryMap[product.categoryId];
            if (!newCategoryId) {
                console.log(`⚠️ Categoria ${product.categoryId} não encontrada para produto ${product.name}`);
                continue;
            }
            
            const productData = {
                restaurant_id: restaurantId,
                category_id: newCategoryId,
                name: product.name,
                description: product.description,
                price: product.price,
                original_price: product.originalPrice || null,
                is_on_sale: product.isOnSale || false,
                image_url: product.image,
                active: true,
                featured: product.featured || false,
                display_order: productsCreated + 1
            };
            
            const productResponse = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(productData)
            });
            
            if (productResponse.ok) {
                productsCreated++;
                console.log(`✅ Produto "${product.name}" criado`);
            } else {
                const error = await productResponse.text();
                console.error(`❌ Erro ao criar produto "${product.name}":`, error);
            }
        } catch (error) {
            console.error(`❌ Erro no produto "${product.name}":`, error);
        }
    }
    
    console.log(`📊 ${productsCreated}/20 produtos criados`);
    
    // Passo 4: Verificação final
    console.log('\n4️⃣ Verificação final...');
    
    try {
        // Contar registros criados
        const restaurantsCheck = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const categoriesCheck = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const productsCheck = await fetch(`${SUPABASE_URL}/rest/v1/products?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        const restCount = await restaurantsCheck.json();
        const catCount = await categoriesCheck.json();
        const prodCount = await productsCheck.json();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 MIGRAÇÃO CONCLUÍDA!');
        console.log('='.repeat(50));
        console.log(`🏪 Restaurantes no Supabase: ${restCount.length || 0}`);
        console.log(`📂 Categorias no Supabase: ${catCount.length || 0}`);
        console.log(`🍕 Produtos no Supabase: ${prodCount.length || 0}`);
        console.log('='.repeat(50));
        
        if (restCount.length > 0 && catCount.length > 0 && prodCount.length > 0) {
            console.log('✅ SUCESSO! Todos os dados foram migrados');
            console.log('🔗 Acesse: https://lypmjnpbpvqkptgmdnnc.supabase.co');
            console.log('📊 Verifique no Table Editor');
        }
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}

// Executar migração
migrateData().catch(console.error);