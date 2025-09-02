// Extrai imagens Base64 dos produtos e salva como arquivos locais
// Depois atualiza o banco para usar URLs locais (zero egress do Supabase)

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
const RESTAURANT_ID = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';

// Diretório para salvar as imagens
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'products');

// Headers padrão para Supabase
const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  console.log('🖼️ Extraindo imagens Base64 para arquivos locais');
  console.log('📊 Isso eliminará 100% do egress de imagens do Supabase\n');

  try {
    // 1. Criar diretório de imagens
    await createImagesDirectory();
    
    // 2. Buscar produtos com imagens base64
    const products = await fetchProductsWithBase64Images();
    console.log(`📦 Encontrados ${products.length} produtos com imagens base64\n`);
    
    if (products.length === 0) {
      console.log('✅ Nenhuma extração necessária - todas as imagens já estão otimizadas!');
      return;
    }
    
    // 3. Extrair cada imagem
    let extracted = 0;
    let failed = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`📸 [${i+1}/${products.length}] Extraindo: ${product.name}`);
      
      try {
        const success = await extractProductImage(product);
        if (success) {
          extracted++;
          console.log(`  ✅ Sucesso - Economia: ~${getImageSizeKB(product.image_url)}KB por carregamento`);
        } else {
          failed++;
          console.log(`  ❌ Falha na extração`);
        }
      } catch (error) {
        failed++;
        console.log(`  ❌ Erro: ${error.message}`);
      }
    }
    
    // 4. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EXTRAÇÃO CONCLUÍDA!');
    console.log(`✅ Imagens extraídas: ${extracted} produtos`);
    console.log(`❌ Falhas: ${failed} produtos`);
    console.log(`💾 Economia total de egress: ~${estimateEgressSavings(extracted)} GB por 100 carregamentos`);
    console.log(`🔥 Redução de egress: 100% (imagens agora são servidas localmente)`);
    console.log(`📁 Imagens salvas em: ${IMAGES_DIR}`);
    
  } catch (error) {
    console.error('💥 Erro geral na extração:', error);
  }
}

/**
 * Criar diretório para imagens se não existir
 */
async function createImagesDirectory() {
  console.log(`📁 Criando diretório: ${IMAGES_DIR}`);
  
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log('✅ Diretório criado com sucesso\n');
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    console.log('✅ Diretório já existe\n');
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
 * Extrair imagem de um produto específico
 */
async function extractProductImage(product) {
  try {
    // 1. Decodificar base64
    const base64Data = product.image_url.split(',')[1];
    if (!base64Data) {
      throw new Error('Base64 inválido');
    }
    
    // 2. Determinar extensão do arquivo
    const mimeType = product.image_url.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
    const extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    
    // 3. Criar nome do arquivo seguro
    const fileName = `${product.id}.${extension}`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    // 4. Salvar arquivo
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(filePath, buffer);
    
    // 5. Criar URL local
    const localUrl = `images/products/${fileName}`;
    
    // 6. Atualizar produto na database com nova URL local
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        image_url: localUrl
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
function estimateEgressSavings(extractedCount) {
  // Assumindo ~200KB por imagem base64, 100 carregamentos
  const originalEgress = (extractedCount * 200 * 100) / (1024 * 1024); // GB
  // Imagens locais = zero egress do Supabase
  return originalEgress.toFixed(2);
}

// Executar extração
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { extractProductImage };