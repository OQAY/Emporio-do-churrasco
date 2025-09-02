// Teste para diagnosticar problemas de carregamento de dados
// Execute no console do navegador para ver o que está acontecendo

console.log('🔍 TESTE DE DIAGNÓSTICO - Carregamento de dados');

// Teste 1: Verificar se app existe
if (typeof window.app === 'undefined') {
  console.log('❌ App não está inicializado globalmente');
} else {
  console.log('✅ App encontrado:', window.app);
}

// Teste 2: Verificar database
if (typeof database === 'undefined') {
  console.log('❌ Database não está acessível');
} else {
  console.log('✅ Database encontrado');
}

// Teste 3: Testar conexão com Supabase
const testSupabaseConnection = async () => {
  console.log('\n🌐 Testando conexão com Supabase...');
  
  try {
    const response = await fetch('https://lypmjnpbpvqkptgmdnnc.supabase.co/rest/v1/products?restaurant_id=eq.b639641d-518a-4bb3-a2b5-f7927d6b6186&select=id,name,price&limit=3', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Supabase respondeu:', data);
    } else {
      console.log('❌ Supabase erro:', response.status, response.statusText);
      const error = await response.text();
      console.log('Detalhes do erro:', error);
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error);
  }
};

// Teste 4: Verificar elementos do DOM
const testDOMElements = () => {
  console.log('\n🏗️ Testando elementos do DOM...');
  
  const elements = [
    'categoryMenuBar',
    'productsGrid', 
    'featuredGrid',
    'emptyState',
    'featuredSection'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ ${id}: encontrado`);
    } else {
      console.log(`❌ ${id}: não encontrado`);
    }
  });
};

// Teste 5: Verificar carregamento de imagens
const testImageLoading = () => {
  console.log('\n🖼️ Testando carregamento de imagens...');
  
  // Testar uma imagem local
  const testImg = new Image();
  testImg.onload = () => console.log('✅ Imagem local carrega: images/products/test.jpg');
  testImg.onerror = () => console.log('❌ Falha ao carregar imagem local');
  testImg.src = 'images/products/92ce8322-9a85-4db7-8f06-e3f866df1720.jpg';
  
  setTimeout(() => {
    console.log(`Status da imagem teste: ${testImg.complete ? 'carregada' : 'carregando...'}`);
  }, 1000);
};

// Executar todos os testes
console.log('Iniciando diagnóstico...\n');
testDOMElements();
testSupabaseConnection();
testImageLoading();

console.log('\n💡 Para resolver problemas:');
console.log('1. Verifique o console para erros JavaScript');
console.log('2. Verifique a aba Network para requisições falhando');
console.log('3. Teste uma imagem diretamente: http://localhost:8080/images/products/92ce8322-9a85-4db7-8f06-e3f866df1720.jpg');