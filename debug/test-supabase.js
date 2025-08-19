// Teste de conexão com Supabase
const SUPABASE_URL = 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';

async function testSupabase() {
    try {
        console.log('🔗 Testando conexão com Supabase...');
        
        // Teste 1: Verificar se o servidor responde
        const pingResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        console.log('📡 Status da conexão:', pingResponse.status);
        
        if (!pingResponse.ok) {
            throw new Error(`Erro de conexão: ${pingResponse.status}`);
        }
        
        // Teste 2: Buscar restaurantes
        console.log('🏪 Buscando restaurantes...');
        const restaurantsResponse = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const restaurants = await restaurantsResponse.json();
        console.log('🏪 Restaurantes encontrados:', restaurants.length);
        console.log('📋 Dados dos restaurantes:', restaurants);
        
        // Teste 3: Buscar categorias
        console.log('📂 Buscando categorias...');
        const categoriesResponse = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const categories = await categoriesResponse.json();
        console.log('📂 Categorias encontradas:', categories.length);
        console.log('📋 Dados das categorias:', categories);
        
        // Teste 4: Buscar produtos
        console.log('🍕 Buscando produtos...');
        const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const products = await productsResponse.json();
        console.log('🍕 Produtos encontrados:', products.length);
        console.log('📋 Dados dos produtos:', products);
        
        // Resumo
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMO DA MIGRAÇÃO:');
        console.log('='.repeat(50));
        console.log(`✅ Conexão: ${pingResponse.ok ? 'OK' : 'ERRO'}`);
        console.log(`🏪 Restaurantes: ${restaurants.length}`);
        console.log(`📂 Categorias: ${categories.length}`);
        console.log(`🍕 Produtos: ${products.length}`);
        console.log('='.repeat(50));
        
        if (restaurants.length > 0 && categories.length > 0 && products.length > 0) {
            console.log('🎉 MIGRAÇÃO REALIZADA COM SUCESSO!');
            console.log('✅ Todos os dados estão salvos no Supabase');
        } else if (restaurants.length > 0) {
            console.log('⚠️ Migração parcial - só restaurante criado');
            console.log('📝 Execute a migração pelo admin-supabase.html');
        } else {
            console.log('❌ Nenhum dado encontrado');
            console.log('📝 Execute o SQL schema e migração');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verificar se as credenciais estão corretas');
        console.log('2. Verificar se o schema SQL foi executado');
        console.log('3. Verificar se o bucket "products" foi criado');
        console.log('4. Verificar conexão com internet');
    }
}

// Executar teste
testSupabase();