/**
 * Version Manager - Force cache invalidation globally
 * NASA Standard: Critical system management
 */

class VersionManager {
    constructor() {
        this.APP_VERSION = '1.3.0';
        this.VERSION_KEY = 'app_version';
        this.FORCE_UPDATE_KEY = 'force_update_check';
        this.LAST_CHECK_KEY = 'version_last_check';
        
        this.checkInterval = 30 * 60 * 1000; // Check every 30 minutes
        this.forceUpdateInterval = 5 * 60 * 1000; // Force check every 5 minutes if outdated
    }

    /**
     * Check if app needs update and force refresh if needed
     */
    async checkAndForceUpdate() {
        try {
            const storedVersion = localStorage.getItem(this.VERSION_KEY);
            const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
            const now = Date.now();
            
            // First time or version mismatch - force update
            if (!storedVersion || storedVersion !== this.APP_VERSION) {
                console.log(`🔄 Version mismatch detected: ${storedVersion} → ${this.APP_VERSION}`);
                return await this.forceAppUpdate();
            }
            
            // Periodic check - verify if server has new version
            if (!lastCheck || (now - parseInt(lastCheck)) > this.checkInterval) {
                console.log('🔍 Checking for version updates...');
                localStorage.setItem(this.LAST_CHECK_KEY, now.toString());
                
                // In a real scenario, you'd check server for version
                // For now, we trust local version
                return false;
            }
            
            return false;
        } catch (error) {
            console.warn('⚠️ Version check failed:', error);
            return false;
        }
    }

    /**
     * Force complete app update - nuclear option
     */
    async forceAppUpdate() {
        console.log('💣 FORCING COMPLETE APP UPDATE...');
        
        try {
            // 1. Clear ALL localStorage data
            this.clearAllStorage();
            
            // 2. Force Service Worker update
            await this.forceServiceWorkerUpdate();
            
            // 3. Clear browser caches
            await this.clearBrowserCaches();
            
            // 4. Set new version
            localStorage.setItem(this.VERSION_KEY, this.APP_VERSION);
            localStorage.setItem(this.LAST_CHECK_KEY, Date.now().toString());
            
            // 5. Show user notification and reload
            this.showUpdateNotification();
            
            // 6. Force page reload after short delay
            setTimeout(() => {
                window.location.reload(true); // Hard reload
            }, 2000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Force update failed:', error);
            // Fallback: just reload the page
            window.location.reload(true);
            return true;
        }
    }

    /**
     * Clear ALL localStorage data (nuclear option)
     */
    clearAllStorage() {
        console.log('🧹 Clearing ALL localStorage...');
        
        const keysToKeep = [this.VERSION_KEY, this.LAST_CHECK_KEY];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
            }
        });
    }

    /**
     * Force Service Worker to update
     */
    async forceServiceWorkerUpdate() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('🔄 Forcing Service Worker update...');
                
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    // Force update
                    await registration.update();
                    
                    // If there's a waiting worker, activate it
                    if (registration.waiting) {
                        registration.waiting.postMessage('SKIP_WAITING');
                    }
                }
                
                console.log('✅ Service Worker update triggered');
            } catch (error) {
                console.warn('⚠️ SW update failed:', error);
            }
        }
    }

    /**
     * Clear browser caches via API (if available)
     */
    async clearBrowserCaches() {
        try {
            if ('caches' in window) {
                console.log('🧹 Clearing browser caches...');
                const cacheNames = await caches.keys();
                
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`🗑️ Deleting cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
                
                console.log('✅ Browser caches cleared');
            }
        } catch (error) {
            console.warn('⚠️ Cache clear failed:', error);
        }
    }

    /**
     * Show user-friendly update notification
     */
    showUpdateNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fb923c;
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                max-width: 320px;
                animation: slideIn 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid white;
                        border-top-color: transparent;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <div>
                        <div style="font-weight: bold;">Atualizando cardápio</div>
                        <div style="font-size: 12px; opacity: 0.9;">Nova versão disponível</div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(notification);
        
        console.log('📢 Update notification shown');
    }

    /**
     * Initialize version checking
     */
    async initialize() {
        // Version Manager initialized
        
        // Check immediately on load
        const needsUpdate = await this.checkAndForceUpdate();
        
        if (!needsUpdate) {
            // Set up periodic checks
            setInterval(() => {
                this.checkAndForceUpdate();
            }, this.checkInterval);
        }
        
        return !needsUpdate; // Return true if app can continue normally
    }

    /**
     * Get current version info
     */
    getVersionInfo() {
        return {
            current: this.APP_VERSION,
            stored: localStorage.getItem(this.VERSION_KEY),
            lastCheck: localStorage.getItem(this.LAST_CHECK_KEY)
        };
    }
}

export default new VersionManager();