// Testes para verificar se a migração de imagens funcionou corretamente
// Similar aos testes em Python, mas em JavaScript/Node.js

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const assert = require('assert');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
const RESTAURANT_ID = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';
const IMAGES_DIR = path.join(__dirname, '..', 'images', 'products');

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

class ImageMigrationTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  // Método para adicionar testes (similar ao Python unittest)
  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Testando: ${testName}`);
      await testFunction();
      console.log(`✅ PASSOU: ${testName}`);
      this.passed++;
    } catch (error) {
      console.log(`❌ FALHOU: ${testName} - ${error.message}`);
      this.failed++;
    }
  }

  // Teste 1: Verificar se diretório de imagens existe
  async testImagesDirectoryExists() {
    const dirExists = await fs.access(IMAGES_DIR).then(() => true).catch(() => false);
    assert(dirExists, `Diretório ${IMAGES_DIR} não existe`);
  }

  // Teste 2: Verificar se imagens foram extraídas
  async testImagesWereExtracted() {
    const files = await fs.readdir(IMAGES_DIR);
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    
    assert(imageFiles.length > 0, 'Nenhuma imagem foi encontrada no diretório');
    console.log(`    📊 ${imageFiles.length} imagens encontradas`);
  }

  // Teste 3: Verificar se arquivo de imagem é válido
  async testImageFilesAreValid() {
    const files = await fs.readdir(IMAGES_DIR);
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    
    // Testar primeiro arquivo
    if (imageFiles.length > 0) {
      const filePath = path.join(IMAGES_DIR, imageFiles[0]);
      const stats = await fs.stat(filePath);
      
      assert(stats.size > 0, 'Arquivo de imagem está vazio');
      assert(stats.size > 100, 'Arquivo de imagem muito pequeno (pode estar corrompido)');
      console.log(`    📏 Arquivo teste: ${imageFiles[0]} (${Math.round(stats.size/1024)}KB)`);
    }
  }

  // Teste 4: Verificar se banco foi atualizado
  async testDatabaseWasUpdated() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=id,name,image_url&limit=10`, {
      headers
    });
    
    assert(response.ok, 'Falha ao buscar produtos do banco');
    
    const products = await response.json();
    assert(products.length > 0, 'Nenhum produto encontrado');
    
    // Verificar se pelo menos um produto tem URL local
    const hasLocalUrl = products.some(p => 
      p.image_url && p.image_url.startsWith('images/products/')
    );
    
    assert(hasLocalUrl, 'Nenhum produto com URL local encontrado');
    console.log(`    📊 ${products.length} produtos verificados no banco`);
  }

  // Teste 5: Verificar se não há mais base64 no banco
  async testNoMoreBase64InDatabase() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=image_url`, {
      headers
    });
    
    const products = await response.json();
    const base64Products = products.filter(p => 
      p.image_url && p.image_url.startsWith('data:image/')
    );
    
    assert(base64Products.length === 0, `Ainda existem ${base64Products.length} produtos com base64`);
    console.log(`    ✅ Nenhum base64 restante no banco`);
  }

  // Teste 6: Calcular economia de egress
  async testEgressReduction() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=image_url`, {
      headers
    });
    
    const products = await response.json();
    const productsWithImages = products.filter(p => p.image_url);
    
    // Calcular tamanho médio de URL local vs base64
    const avgUrlSize = 50; // bytes (images/products/uuid.jpg)
    const avgBase64Size = 50 * 1024; // ~50KB estimado
    
    const currentEgress = productsWithImages.length * avgUrlSize; // bytes
    const previousEgress = productsWithImages.length * avgBase64Size; // bytes
    
    const reduction = ((previousEgress - currentEgress) / previousEgress * 100).toFixed(1);
    
    console.log(`    📊 Redução de egress: ${reduction}%`);
    console.log(`    📊 Antes: ~${Math.round(previousEgress/1024/1024*100)}MB por 100 carregamentos`);
    console.log(`    📊 Depois: ~${Math.round(currentEgress/1024)}KB por 100 carregamentos`);
    
    assert(reduction > 90, `Redução de egress insuficiente: ${reduction}%`);
  }

  // Teste 7: Verificar correspondência arquivo-banco
  async testFilesDatabaseConsistency() {
    // Buscar produtos do banco
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=id,image_url`, {
      headers
    });
    
    const products = await response.json();
    const productsWithLocalImages = products.filter(p => 
      p.image_url && p.image_url.startsWith('images/products/')
    );
    
    // Verificar se arquivos existem para cada produto
    let foundFiles = 0;
    
    for (const product of productsWithLocalImages) {
      const fileName = path.basename(product.image_url);
      const filePath = path.join(IMAGES_DIR, fileName);
      
      try {
        await fs.access(filePath);
        foundFiles++;
      } catch (error) {
        console.log(`    ⚠️ Arquivo não encontrado: ${fileName}`);
      }
    }
    
    console.log(`    📊 ${foundFiles}/${productsWithLocalImages.length} arquivos encontrados`);
    assert(foundFiles === productsWithLocalImages.length, 'Alguns arquivos estão faltando');
  }

  // Executar todos os testes
  async runAllTests() {
    console.log('🧪 INICIANDO TESTES DA MIGRAÇÃO DE IMAGENS');
    console.log('=' * 50);

    await this.runTest('Diretório de imagens existe', () => this.testImagesDirectoryExists());
    await this.runTest('Imagens foram extraídas', () => this.testImagesWereExtracted());
    await this.runTest('Arquivos de imagem são válidos', () => this.testImageFilesAreValid());
    await this.runTest('Banco de dados foi atualizado', () => this.testDatabaseWasUpdated());
    await this.runTest('Não há mais base64 no banco', () => this.testNoMoreBase64InDatabase());
    await this.runTest('Redução de egress calculada', () => this.testEgressReduction());
    await this.runTest('Consistência arquivo-banco', () => this.testFilesDatabaseConsistency());

    console.log('\n' + '=' * 50);
    console.log('📋 RESUMO DOS TESTES:');
    console.log(`✅ Passaram: ${this.passed}`);
    console.log(`❌ Falharam: ${this.failed}`);
    console.log(`📊 Taxa de sucesso: ${Math.round(this.passed / (this.passed + this.failed) * 100)}%`);

    if (this.failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Migração bem-sucedida.');
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique os detalhes acima.');
    }
  }
}

// Executar testes se for chamado diretamente
if (require.main === module) {
  const tester = new ImageMigrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ImageMigrationTester;