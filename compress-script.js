// Script para comprimir imagens via console do navegador
// Cole este código no console do admin panel

async function compressAllImages() {
    console.log('🚀 Iniciando compressão de imagens...');
    
    try {
        // Buscar todas as imagens base64 diretamente do Supabase
        const images = [];
        const products = await database.getProducts();
        
        console.log(`📊 ${products.length} produtos encontrados`);
        
        // Coletar imagens base64
        products.forEach(product => {
            if (product.image && product.image.startsWith('data:image/')) {
                const originalSize = Math.round((product.image.length * 3) / 4);
                console.log(`📷 ${product.name}: ${formatFileSize(originalSize)}`);
                
                images.push({
                    id: product.id,
                    name: product.name,
                    originalImage: product.image,
                    originalSize: originalSize
                });
            }
        });
        
        if (images.length === 0) {
            console.log('❌ Nenhuma imagem base64 encontrada');
            return;
        }
        
        console.log(`🔍 Total: ${images.length} imagens para comprimir`);
        
        let totalSavings = 0;
        let compressed = 0;
        
        // Comprimir uma por vez
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            console.log(`🔄 [${i+1}/${images.length}] Comprimindo: ${img.name}`);
            
            try {
                // Converter base64 para File
                const response = await fetch(img.originalImage);
                const blob = await response.blob();
                const file = new File([blob], img.name, { type: blob.type });
                
                // Comprimir usando canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const image = new Image();
                
                const compressedImage = await new Promise((resolve, reject) => {
                    image.onload = () => {
                        // Reduzir tamanho se muito grande
                        let { width, height } = image;
                        const maxSize = 800;
                        
                        if (width > maxSize || height > maxSize) {
                            const ratio = Math.min(maxSize / width, maxSize / height);
                            width *= ratio;
                            height *= ratio;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Desenhar e comprimir
                        ctx.drawImage(image, 0, 0, width, height);
                        canvas.toBlob(resolve, 'image/jpeg', 0.8);
                    };
                    image.onerror = reject;
                    image.src = img.originalImage;
                });
                
                // Converter de volta para base64
                const compressedBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(compressedImage);
                });
                
                const newSize = Math.round((compressedBase64.length * 3) / 4);
                const savings = img.originalSize - newSize;
                totalSavings += savings;
                
                // Atualizar no banco
                const product = products.find(p => p.id === img.id);
                if (product) {
                    product.image = compressedBase64;
                    await database.updateProduct(product);
                    compressed++;
                    
                    const savingsPercent = Math.round((savings / img.originalSize) * 100);
                    console.log(`✅ ${img.name}: ${formatFileSize(img.originalSize)} → ${formatFileSize(newSize)} (-${savingsPercent}%)`);
                }
                
            } catch (error) {
                console.error(`❌ Erro em ${img.name}:`, error);
            }
        }
        
        console.log(`\n🎉 Compressão concluída!`);
        console.log(`📊 ${compressed}/${images.length} imagens comprimidas`);
        console.log(`💾 Economia total: ${formatFileSize(totalSavings)}`);
        
        // Recarregar página para ver mudanças
        location.reload();
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Executar
compressAllImages();