// Script para verificar o status das imagens no Supabase
import { SupabaseClient } from './src/js/supabase/supabase-client.js';

async function checkImageStatus() {
    const client = new SupabaseClient();
    
    console.log('🔍 Verificando status das imagens no Supabase...\n');
    
    try {
        // Buscar alguns produtos para verificar
        const products = await client.makeRequest(
            'products?restaurant_id=eq.b639641d-518a-4bb3-a2b5-f7927d6b6186&limit=5&select=id,name,image_url'
        );
        
        console.log(`📦 Total de produtos verificados: ${products.length}\n`);
        
        let base64Count = 0;
        let urlCount = 0;
        let nullCount = 0;
        
        products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name} (ID: ${product.id})`);
            
            if (!product.image_url) {
                console.log('   ❌ SEM IMAGEM (null)');
                nullCount++;
            } else if (product.image_url.startsWith('data:image')) {
                console.log('   📸 Base64 (tamanho: ' + Math.round(product.image_url.length / 1024) + ' KB)');
                console.log('   Preview: ' + product.image_url.substring(0, 50) + '...');
                base64Count++;
            } else if (product.image_url.startsWith('http')) {
                console.log('   🔗 URL: ' + product.image_url);
                urlCount++;
            } else {
                console.log('   ❓ Formato desconhecido: ' + product.image_url.substring(0, 100));
            }
        });
        
        console.log('\n📊 RESUMO:');
        console.log(`   - Imagens Base64: ${base64Count}`);
        console.log(`   - Imagens URL: ${urlCount}`);
        console.log(`   - Sem imagem: ${nullCount}`);
        
        // Verificar todos os produtos para estatística completa
        const allProducts = await client.makeRequest(
            'products?restaurant_id=eq.b639641d-518a-4bb3-a2b5-f7927d6b6186&select=id,image_url'
        );
        
        let totalBase64 = 0;
        let totalUrl = 0;
        let totalNull = 0;
        
        allProducts.forEach(product => {
            if (!product.image_url) {
                totalNull++;
            } else if (product.image_url.startsWith('data:image')) {
                totalBase64++;
            } else if (product.image_url.startsWith('http')) {
                totalUrl++;
            }
        });
        
        console.log('\n📈 ESTATÍSTICA COMPLETA (todos os produtos):');
        console.log(`   - Total de produtos: ${allProducts.length}`);
        console.log(`   - Com Base64: ${totalBase64} (${Math.round(totalBase64/allProducts.length*100)}%)`);
        console.log(`   - Com URL: ${totalUrl} (${Math.round(totalUrl/allProducts.length*100)}%)`);
        console.log(`   - Sem imagem: ${totalNull} (${Math.round(totalNull/allProducts.length*100)}%)`);
        
        if (totalBase64 > 0) {
            console.log('\n⚠️  MIGRAÇÃO NECESSÁRIA!');
            console.log(`   Ainda existem ${totalBase64} produtos com imagens em Base64.`);
            console.log('   Essas imagens precisam ser migradas para URLs do Supabase Storage.');
        } else if (totalNull > 0) {
            console.log('\n⚠️  PRODUTOS SEM IMAGEM!');
            console.log(`   Existem ${totalNull} produtos sem imagem definida.`);
        } else {
            console.log('\n✅ Todas as imagens estão em formato URL!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar imagens:', error);
    }
}

// Executar verificação
checkImageStatus();