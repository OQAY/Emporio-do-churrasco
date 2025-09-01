// Auto Test Upload - Execute no console
console.log('🤖 AUTOMATED UPLOAD TEST STARTING...');

async function runTest() {
    try {
        // Step 1: Import database
        console.log('📦 Importing database...');
        const { default: database } = await import('../src/js/database-nasa.js');
        console.log('✅ Database imported');
        
        // Step 2: Authenticate
        console.log('🔑 Authenticating...');
        const isAuth = database.isAuthenticated();
        if (!isAuth) {
            database.authenticate('admin', 'admin123');
            console.log('✅ Authenticated');
        } else {
            console.log('✅ Already authenticated');
        }
        
        // Step 3: Load data
        console.log('📊 Loading data from Supabase...');
        await database.loadData();
        console.log('✅ Data loaded');
        
        // Step 4: Check current gallery count
        const beforeImages = database.getGalleryImages();
        console.log(`📸 Images BEFORE upload: ${beforeImages.length}`);
        
        // Step 5: Upload test image
        console.log('📤 Uploading test image...');
        const testImage = {
            name: 'Auto Test ' + new Date().toLocaleTimeString(),
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            size: 95,
            type: 'image/png',
            tags: ['auto-test']
        };
        
        const uploadResult = await database.addGalleryImage(testImage);
        console.log('✅ Upload result:', uploadResult);
        
        // Step 6: Check gallery count after upload
        const afterImages = database.getGalleryImages();
        console.log(`📸 Images AFTER upload: ${afterImages.length}`);
        
        // Step 7: Results
        const increase = afterImages.length - beforeImages.length;
        console.log(`📈 Image count increase: ${increase}`);
        
        if (increase > 0) {
            console.log('🎉 SUCCESS: Upload is working correctly!');
            console.log('Latest image:', afterImages[0]);
        } else {
            console.log('❌ PROBLEM: Image count did not increase');
            console.log('Debugging cache...');
            const cacheData = database.cache.getCache();
            console.log('Cache keys:', Object.keys(cacheData || {}));
            console.log('Gallery in cache:', cacheData?.galleryImages?.length || 0);
        }
        
        return { success: increase > 0, beforeCount: beforeImages.length, afterCount: afterImages.length };
        
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        return { success: false, error: error.message };
    }
}

// Run the test
runTest().then(result => {
    console.log('🏁 TEST COMPLETED:', result);
});