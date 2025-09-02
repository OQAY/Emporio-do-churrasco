// Migração de imagens Base64 para Supabase Storage
// Reduz drasticamente o egress (de ~200KB por produto para ~100 bytes)

require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
const RESTAURANT_ID = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';

// Headers padrão para Supabase
const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  console.log('🚀 Iniciando migração de imagens Base64 → Supabase Storage');
  console.log('📊 Isso deve reduzir o egress de ~12GB para ~0.5GB (95% de economia)\n');

  try {
    // 1. Criar bucket se não existir
    await createStorageBucket();
    
    // 2. Buscar produtos com imagens base64
    const products = await fetchProductsWithBase64Images();
    console.log(`📦 Encontrados ${products.length} produtos com imagens base64\n`);
    
    if (products.length === 0) {
      console.log('✅ Nenhuma migração necessária - todas as imagens já estão otimizadas!');
      return;
    }
    
    // 3. Migrar cada produto
    let migrated = 0;
    let failed = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`📸 [${i+1}/${products.length}] Migrando: ${product.name}`);
      
      try {
        const success = await migrateProductImage(product);
        if (success) {
          migrated++;
          console.log(`  ✅ Sucesso - Economia de egress: ~${getImageSizeKB(product.image_url)}KB`);
        } else {
          failed++;
          console.log(`  ❌ Falha na migração`);
        }
      } catch (error) {
        failed++;
        console.log(`  ❌ Erro: ${error.message}`);
      }
      
      // Pequena pausa para não sobrecarregar a API
      await sleep(500);
    }
    
    // 4. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log(`✅ Migrados com sucesso: ${migrated} produtos`);
    console.log(`❌ Falhas: ${failed} produtos`);
    console.log(`💾 Economia estimada de egress: ~${estimateEgressSavings(migrated)} GB por 100 carregamentos`);
    console.log(`🔥 Redução de egress: ~95%`);
    
  } catch (error) {
    console.error('💥 Erro geral na migração:', error);
  }
}

/**
 * Criar bucket para imagens de produtos
 */
async function createStorageBucket() {
  console.log('🗂️ Criando bucket "product-images" no Supabase Storage...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: 'product-images',
        name: 'product-images',
        public: true,
        file_size_limit: 5242880, // 5MB por arquivo
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      })
    });
    
    if (response.status === 200 || response.status === 409) { // 409 = já existe
      console.log('✅ Bucket "product-images" pronto para uso\n');
    } else {
      const error = await response.text();
      console.log(`⚠️ Bucket: ${error} (pode já existir)\n`);
    }
  } catch (error) {
    console.log(`⚠️ Erro ao criar bucket: ${error.message}\n`);
  }
}

/**
 * Buscar produtos que ainda usam base64
 */
async function fetchProductsWithBase64Images() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=id,name,image_url`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar produtos: ${response.status}`);
  }
  
  const products = await response.json();
  
  // Filtrar apenas produtos com base64
  return products.filter(product => 
    product.image_url && 
    product.image_url.startsWith('data:image/')
  );
}

/**
 * Migrar imagem de um produto específico
 */
async function migrateProductImage(product) {
  try {
    // 1. Converter base64 para blob
    const blob = base64ToBlob(product.image_url);
    if (!blob) {
      throw new Error('Falha ao converter base64');
    }
    
    // 2. Gerar nome único para arquivo
    const fileName = `${product.id}.jpg`;
    
    // 3. Upload para Storage
    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: blob
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload falhou: ${error}`);
    }
    
    // 4. Obter URL pública
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
    
    // 5. Atualizar produto na database com nova URL
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        image_url: publicUrl
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Falha ao atualizar produto: ${updateResponse.status}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`    Detalhes do erro: ${error.message}`);
    return false;
  }
}

/**
 * Converter base64 para blob
 */
function base64ToBlob(base64String) {
  try {
    // Extrair dados da string base64
    const [header, data] = base64String.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    
    // Converter para buffer
    const buffer = Buffer.from(data, 'base64');
    
    // Criar blob-like object para Node.js
    return buffer;
    
  } catch (error) {
    console.log(`    Erro ao converter base64: ${error.message}`);
    return null;
  }
}

/**
 * Estimar tamanho da imagem em KB
 */
function getImageSizeKB(base64String) {
  if (!base64String || !base64String.includes(',')) return 0;
  
  const data = base64String.split(',')[1];
  const sizeInBytes = (data.length * 3) / 4; // Estimativa base64
  return Math.round(sizeInBytes / 1024);
}

/**
 * Estimar economia de egress
 */
function estimateEgressSavings(migratedCount) {
  // Assumindo ~200KB por imagem base64, 100 carregamentos
  const originalEgress = (migratedCount * 200 * 100) / (1024 * 1024); // GB
  const newEgress = (migratedCount * 0.1 * 100) / (1024 * 1024); // URLs são ~100 bytes
  return (originalEgress - newEgress).toFixed(2);
}

/**
 * Pausa em milissegundos
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar migração
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateProductImage, createStorageBucket };