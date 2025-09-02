// Script para forçar atualização global - simula usuário antigo
console.log('🚀 FORCE UPDATE SIMULATOR');
console.log('Este script simula um cliente com cache antigo');

// Simular cache antigo setando versão antiga
localStorage.setItem('app_version', '1.0.0');
localStorage.setItem('menu_admin_cache_version', '2.0');

// Adicionar dados antigos problemáticos
localStorage.setItem('old_problematic_data', 'should_be_removed');
localStorage.setItem('menu_admin_cache', JSON.stringify({
  old: 'problematic_data',
  version: '1.0',
  timestamp: Date.now() - (24 * 60 * 60 * 1000) // 24h ago
}));

console.log('✅ Configurado como cliente antigo');
console.log('📋 Dados simulados:');
console.log('  - app_version: 1.0.0 (antiga)');
console.log('  - cache_version: 2.0 (antiga)');
console.log('  - Dados problemáticos adicionados');
console.log('');
console.log('🔄 Agora recarregue a página para ver a atualização forçada!');
console.log('   O sistema deve detectar versão antiga e forçar update completo.');