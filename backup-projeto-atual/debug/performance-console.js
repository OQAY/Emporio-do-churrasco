// Performance Console - Execute no console do navegador (F12)
console.log('🎯 PERFORMANCE CONSOLE LOADED');

// Global performance monitor
window.adminPerf = {
    startTime: Date.now(),
    
    // Show cache stats
    showCacheStats() {
        if (window.testAdmin?.database?.cache) {
            const stats = window.testAdmin.database.cache.getStats();
            console.table(stats);
            return stats;
        } else {
            console.warn('Admin not loaded. Run: loadAdmin() first');
        }
    },
    
    // Load admin and track performance
    async loadAdmin() {
        const start = performance.now();
        console.log('⏱️ Loading admin...');
        
        try {
            // Import modules
            const { default: database } = await import('../src/js/database-nasa.js');
            const AdminViewModule = await import('../src/js/views/AdminView.js');
            const AdminControllerModule = await import('../src/js/controllers/AdminController.js');
            
            // Create instances
            const adminView = new AdminViewModule.AdminView();
            const adminController = new AdminControllerModule.AdminController(database, adminView);
            
            // Store globally
            window.testAdmin = adminController;
            window.testDatabase = database;
            window.testView = adminView;
            
            const loadTime = Math.round(performance.now() - start);
            console.log(`✅ Admin loaded in ${loadTime}ms`);
            
            return { loadTime, controller: adminController };
        } catch (error) {
            console.error('❌ Load failed:', error);
            throw error;
        }
    },
    
    // Test gallery performance
    async testGallery() {
        if (!window.testAdmin) {
            await this.loadAdmin();
        }
        
        const start = performance.now();
        console.log('📸 Testing gallery performance...');
        
        // Create mock content area if needed
        if (!document.getElementById('contentArea')) {
            const contentArea = document.createElement('div');
            contentArea.id = 'contentArea';
            document.body.appendChild(contentArea);
        }
        
        try {
            await window.testAdmin.showGallery();
            const galleryTime = Math.round(performance.now() - start);
            
            const images = window.testDatabase.getGalleryImages();
            console.log(`✅ Gallery loaded ${images.length} images in ${galleryTime}ms`);
            
            return { galleryTime, imageCount: images.length };
        } catch (error) {
            console.error('❌ Gallery test failed:', error);
            throw error;
        }
    },
    
    // Monitor localStorage usage
    checkStorageUsage() {
        const quota = 5 * 1024 * 1024; // 5MB typical limit
        let used = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                used += localStorage[key].length + key.length;
            }
        }
        
        const usedKB = Math.round(used / 1024);
        const quotaKB = Math.round(quota / 1024);
        const percentage = Math.round((used / quota) * 100);
        
        console.log(`💾 localStorage: ${usedKB}KB / ${quotaKB}KB (${percentage}%)`);
        
        // Show menu-related cache specifically
        const menuCache = localStorage.getItem('menu_admin_cache');
        if (menuCache) {
            const menuSizeKB = Math.round(menuCache.length / 1024);
            console.log(`📱 Menu cache: ${menuSizeKB}KB`);
        }
        
        return { used: usedKB, quota: quotaKB, percentage };
    },
    
    // Comprehensive performance report
    async fullReport() {
        console.log('📊 GENERATING PERFORMANCE REPORT...');
        
        const report = {
            timestamp: new Date().toISOString(),
            browser: navigator.userAgent.split(')')[0] + ')',
            storage: this.checkStorageUsage()
        };
        
        try {
            if (!window.testAdmin) {
                const loadResult = await this.loadAdmin();
                report.loadTime = loadResult.loadTime;
            }
            
            report.cache = this.showCacheStats();
            
            const galleryResult = await this.testGallery();
            report.gallery = galleryResult;
            
            console.log('📈 PERFORMANCE REPORT:');
            console.table(report);
            
            // Performance recommendations
            console.log('💡 RECOMMENDATIONS:');
            if (report.loadTime > 2000) {
                console.log('⚠️ Load time > 2s - consider optimizing imports');
            }
            if (report.gallery?.galleryTime > 1000) {
                console.log('⚠️ Gallery load > 1s - consider image lazy loading');
            }
            if (report.storage?.percentage > 80) {
                console.log('⚠️ localStorage > 80% - consider cache cleanup');
            }
            if (report.cache?.hitRate < 50) {
                console.log('⚠️ Cache hit rate < 50% - check cache strategy');
            }
            
            return report;
            
        } catch (error) {
            console.error('❌ Report generation failed:', error);
            return { error: error.message };
        }
    }
};

// Quick access functions
window.loadAdmin = window.adminPerf.loadAdmin.bind(window.adminPerf);
window.testGallery = window.adminPerf.testGallery.bind(window.adminPerf);
window.cacheStats = window.adminPerf.showCacheStats.bind(window.adminPerf);
window.perfReport = window.adminPerf.fullReport.bind(window.adminPerf);

console.log('🔧 Available commands:');
console.log('  loadAdmin() - Load admin panel');
console.log('  testGallery() - Test gallery performance'); 
console.log('  cacheStats() - Show cache statistics');
console.log('  perfReport() - Generate full performance report');
console.log('  adminPerf.checkStorageUsage() - Check localStorage usage');