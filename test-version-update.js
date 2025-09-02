// Script para testar atualização de versão - execute no console do navegador

console.log('🧪 TESTE: Simulando cliente com versão antiga...');

// 1. Simular versão antiga
localStorage.setItem('app_version', '1.0.0');

// 2. Adicionar cache antigo problemático  
localStorage.setItem('menu_admin_cache', JSON.stringify({
    version: '1.0',
    timestamp: Date.now() - (6 * 60 * 1000), // 6 minutos atrás (expiry = 5 min)
    data: 'old_problematic_data'
}));

console.log('✅ Cliente configurado como versão antiga');
console.log('📝 Dados definidos:');
console.log('   - app_version: 1.0.0 (atual app espera 1.4.0)');
console.log('   - Cache antigo com timestamp expirado');

console.log('');
console.log('🔄 TESTE: Recarregue a página agora!');
console.log('   Expected behavior:');
console.log('   1. Version Manager detecta versão antiga (1.0.0 ≠ 1.4.0)');
console.log('   2. Executa forceAppUpdate()');
console.log('   3. Limpa todo localStorage');
console.log('   4. Força Service Worker update');
console.log('   5. Mostra notificação de atualização');
console.log('   6. Recarrega página com versão nova e logs limpos');