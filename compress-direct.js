// Script direto para comprimir imagens via console
// Cola no console do admin.html

async function compressImagesDirectly() {
    console.log('🚀 Iniciando compressão direta...');
    
    const SUPABASE_URL = 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
    const RESTAURANT_ID = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';
    
    const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    };
    
    try {
        // Buscar apenas produtos com imagens base64 (sem carregar as imagens)
        console.log('🔍 Buscando produtos...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?restaurant_id=eq.${RESTAURANT_ID}&select=id,name,image_url&image_url=like.data:image*`, {
            headers
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        console.log(`📊 ${products.length} produtos com imagens base64 encontrados`);
        
        if (products.length === 0) {
            console.log('❌ Nenhuma imagem base64 encontrada');
            return;
        }
        
        let totalSavings = 0;
        let compressed = 0;
        
        // Comprimir uma por vez
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const originalSize = Math.round((product.image_url.length * 3) / 4);
            
            console.log(`🔄 [${i+1}/${products.length}] ${product.name}: ${formatFileSize(originalSize)}`);
            
            try {
                // Comprimir imagem
                const compressedBase64 = await compressImage(product.image_url);
                const newSize = Math.round((compressedBase64.length * 3) / 4);
                const savings = originalSize - newSize;
                
                // Só atualizar se houve economia significativa
                if (savings > originalSize * 0.1) { // 10% economia mínima
                    // Atualizar no Supabase
                    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            image_url: compressedBase64
                        })
                    });
                    
                    if (updateResponse.ok) {
                        totalSavings += savings;
                        compressed++;
                        const savingsPercent = Math.round((savings / originalSize) * 100);
                        console.log(`✅ ${formatFileSize(originalSize)} → ${formatFileSize(newSize)} (-${savingsPercent}%)`);
                    } else {
                        console.error(`❌ Erro ao atualizar ${product.name}`);
                    }
                } else {
                    console.log(`⏭️ Pulando ${product.name} (economia < 10%)`);
                }
                
            } catch (error) {
                console.error(`❌ Erro ao comprimir ${product.name}:`, error);
            }
        }
        
        console.log(`\n🎉 Compressão concluída!`);
        console.log(`📊 ${compressed}/${products.length} imagens comprimidas`);
        console.log(`💾 Economia total: ${formatFileSize(totalSavings)}`);
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

async function compressImage(base64Data) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Redimensionar se muito grande
            let { width, height } = img;
            const maxSize = 800;
            
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar com qualidade reduzida
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para JPEG com qualidade 75%
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressed);
        };
        
        img.onerror = reject;
        img.src = base64Data;
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Executar
compressImagesDirectly();