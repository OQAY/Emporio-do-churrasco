// Debug script - Execute no console do navegador (F12)
console.log('🧪 INICIANDO TESTE DE UPLOAD...');

// Test 1: Import database
try {
    const { default: database } = await import('./src/js/database-nasa.js');
    console.log('✅ Database imported successfully');
    
    // Test 2: Authentication
    const isAuth = database.isAuthenticated();
    console.log('🔑 Auth status:', isAuth);
    
    if (!isAuth) {
        const authResult = database.authenticate('admin', 'admin123');
        console.log('🔑 Auth result:', authResult);
    }
    
    // Test 3: Load data
    console.log('📊 Loading data...');
    await database.loadData();
    console.log('✅ Data loaded successfully');
    
    // Test 4: Check current gallery
    const currentImages = database.getGalleryImages();
    console.log('📸 Current gallery images:', currentImages.length);
    console.log('Images:', currentImages);
    
    // Test 5: Add test image
    console.log('📸 Testing image upload...');
    
    const testImageData = {
        name: 'Test Upload Image',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        size: 95,
        type: 'image/png',
        tags: ['test']
    };
    
    const result = await database.addGalleryImage(testImageData);
    console.log('✅ Upload result:', result);
    
    // Test 6: Verify upload
    const updatedImages = database.getGalleryImages();
    console.log('📸 Updated gallery images:', updatedImages.length);
    console.log('New images:', updatedImages);
    
} catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error('Stack:', error.stack);
}