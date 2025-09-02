// Script para limpar cache problemático
console.log('🧹 Limpando cache problemático...');

// Limpar todos os dados relacionados ao menu
const keysToRemove = [
    'menu_admin_cache',
    'menu_admin_cache_timestamp', 
    'menu_admin_cache_version',
    'menu_admin_last_modified',
    'restaurante_config',
    'menu_produtos',
    'menu_categorias'
];

keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido: ${key}`);
    }
});

console.log('✅ Cache limpo! Recarregue a página.');