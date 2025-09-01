// Test Runner - Simula ambiente do navegador para testes
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:8080',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;
global.fetch = fetch;

// Mock console with colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function colorLog(msg, color = 'reset') {
    console.log(colors[color] + msg + colors.reset);
}

colorLog('🤖 STARTING AUTOMATED UPLOAD TEST...', 'blue');

async function runTest() {
    try {
        colorLog('📦 Importing database module...', 'yellow');
        
        // Dynamic import with full path
        const databaseModule = await import('../src/js/database-nasa.js');
        const database = databaseModule.default;
        
        colorLog('✅ Database imported successfully', 'green');
        
        // Test authentication
        colorLog('🔑 Testing authentication...', 'yellow');
        const authResult = database.authenticate('admin', 'admin123');
        colorLog(`Auth result: ${authResult}`, authResult ? 'green' : 'red');
        
        // Test data loading
        colorLog('📊 Loading data...', 'yellow');
        await database.loadData();
        colorLog('✅ Data loaded successfully', 'green');
        
        // Check gallery before upload
        const beforeImages = database.getGalleryImages();
        colorLog(`📸 Gallery images BEFORE: ${beforeImages.length}`, 'blue');
        
        // Test image upload
        colorLog('📤 Testing image upload...', 'yellow');
        const testImage = {
            name: 'Node Test ' + new Date().toISOString(),
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            size: 95,
            type: 'image/png',
            tags: ['node-test']
        };
        
        const uploadResult = await database.addGalleryImage(testImage);
        colorLog('✅ Upload completed', 'green');
        colorLog(`Upload result ID: ${uploadResult?.id}`, 'blue');
        
        // Check gallery after upload
        const afterImages = database.getGalleryImages();
        colorLog(`📸 Gallery images AFTER: ${afterImages.length}`, 'blue');
        
        // Results
        const increase = afterImages.length - beforeImages.length;
        colorLog(`📈 Image count change: ${increase}`, increase > 0 ? 'green' : 'red');
        
        if (increase > 0) {
            colorLog('🎉 SUCCESS: Upload system working!', 'green');
        } else {
            colorLog('❌ ISSUE: Gallery count not updated', 'red');
            
            // Debug cache
            colorLog('🔍 Debugging cache...', 'yellow');
            const cache = database.cache.getCache();
            if (cache) {
                colorLog(`Cache keys: ${Object.keys(cache).join(', ')}`, 'blue');
                colorLog(`Gallery in cache: ${cache.galleryImages?.length || 0}`, 'blue');
            } else {
                colorLog('❌ No cache data found', 'red');
            }
        }
        
        return {
            success: increase > 0,
            beforeCount: beforeImages.length,
            afterCount: afterImages.length,
            uploadResult
        };
        
    } catch (error) {
        colorLog(`❌ TEST FAILED: ${error.message}`, 'red');
        colorLog(`Stack: ${error.stack}`, 'red');
        return { success: false, error: error.message };
    }
}

// Run test
runTest()
    .then(result => {
        colorLog('\n🏁 TEST RESULTS:', 'magenta');
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        colorLog(`💥 RUNNER ERROR: ${error.message}`, 'red');
        process.exit(1);
    });