// Script para verificar o status das imagens no Supabase (Node.js)

const SUPABASE_URL = 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
const RESTAURANT_ID = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';

async function fetchProducts(limit = null) {
    const limitQuery = limit ? `&limit=${limit}` : '';
    const url = `${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}${limitQuery}&select=id,name,image_url`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
}

async function checkImageStatus() {
    console.log('🔍 Verificando status das imagens no Supabase...\n');
    console.log(`📍 URL: ${SUPABASE_URL}`);
    console.log(`🏪 Restaurant ID: ${RESTAURANT_ID}\n`);
    
    // Buscar alguns produtos para verificar detalhes
    const sampleProducts = await fetchProducts(5);
    
    console.log(`📦 Amostra de ${sampleProducts.length} produtos:\n`);
    
    let base64Count = 0;
    let urlCount = 0;
    let nullCount = 0;
    
    sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        
        if (!product.image_url || product.image_url === null) {
            console.log('   ❌ SEM IMAGEM (null)\n');
            nullCount++;
        } else if (product.image_url.startsWith('data:image')) {
            const sizeKB = Math.round(product.image_url.length / 1024);
            console.log(`   📸 FORMATO: Base64`);
            console.log(`   📏 TAMANHO: ${sizeKB} KB`);
            console.log(`   🔍 PREVIEW: ${product.image_url.substring(0, 50)}...\n`);
            base64Count++;
        } else if (product.image_url.startsWith('http')) {
            console.log(`   🔗 FORMATO: URL`);
            console.log(`   📍 LINK: ${product.image_url}\n`);
            urlCount++;
        } else {
            console.log(`   ❓ FORMATO DESCONHECIDO`);
            console.log(`   📝 CONTEÚDO: ${product.image_url.substring(0, 100)}...\n`);
        }
    });
    
    // Buscar todos os produtos para estatística completa
    console.log('📊 Analisando todos os produtos...\n');
    const allProducts = await fetchProducts();
    
    let totalBase64 = 0;
    let totalUrl = 0;
    let totalNull = 0;
    let totalOther = 0;
    
    allProducts.forEach(product => {
        if (!product.image_url || product.image_url === null) {
            totalNull++;
        } else if (product.image_url.startsWith('data:image')) {
            totalBase64++;
        } else if (product.image_url.startsWith('http')) {
            totalUrl++;
        } else {
            totalOther++;
        }
    });
    
    console.log('═══════════════════════════════════════════');
    console.log('📈 RELATÓRIO COMPLETO');
    console.log('═══════════════════════════════════════════\n');
    console.log(`📦 Total de produtos: ${allProducts.length}`);
    console.log(`\n📸 Distribuição de imagens:`);
    console.log(`   • Base64: ${totalBase64} produtos (${Math.round(totalBase64/allProducts.length*100)}%)`);
    console.log(`   • URL: ${totalUrl} produtos (${Math.round(totalUrl/allProducts.length*100)}%)`);
    console.log(`   • Sem imagem: ${totalNull} produtos (${Math.round(totalNull/allProducts.length*100)}%)`);
    if (totalOther > 0) {
        console.log(`   • Outro formato: ${totalOther} produtos (${Math.round(totalOther/allProducts.length*100)}%)`);
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('💡 DIAGNÓSTICO');
    console.log('═══════════════════════════════════════════\n');
    
    if (totalBase64 > 0 && totalUrl === 0) {
        console.log('⚠️  MIGRAÇÃO NÃO REALIZADA!');
        console.log(`   • Todos os ${totalBase64} produtos ainda usam Base64`);
        console.log('   • Nenhuma imagem foi migrada para URL ainda');
        console.log('   • Recomendação: Executar migração para Supabase Storage');
    } else if (totalBase64 > 0 && totalUrl > 0) {
        console.log('⚠️  MIGRAÇÃO PARCIAL!');
        console.log(`   • ${totalUrl} produtos já migrados para URL`);
        console.log(`   • ${totalBase64} produtos ainda em Base64`);
        console.log('   • Recomendação: Completar migração dos produtos restantes');
    } else if (totalUrl > 0 && totalBase64 === 0) {
        console.log('✅ MIGRAÇÃO COMPLETA!');
        console.log(`   • Todos os ${totalUrl} produtos usam URLs`);
        console.log('   • Nenhum produto usa Base64');
    }
    
    if (totalNull > 0) {
        console.log(`\n⚠️  ${totalNull} PRODUTOS SEM IMAGEM!`);
        console.log('   • Estes produtos aparecem sem foto no cardápio');
        console.log('   • Recomendação: Adicionar imagens via painel admin');
    }
    
    console.log('\n═══════════════════════════════════════════\n');
}

// Executar verificação
checkImageStatus().catch(console.error);