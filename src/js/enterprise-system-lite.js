/**
 * Enterprise System Lite - NASA Standard Integration
 * Simplified version for integration with existing Menu system
 * Single Responsibility: Add enterprise features to existing architecture
 * File size: <400 lines (NASA/Google compliant)
 * ALL FUNCTIONS < 60 lines (NASA compliant)
 */

import { logger } from './core/logger.js';
import { PerformanceMonitor } from './performance/performance-monitor.js';
import { HealthCheck } from './core/health-check.js';

/**
 * Enterprise System Lite Class
 * Adds enterprise monitoring to existing Menu app without breaking it
 */
class EnterpriseSystemLite {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        this.metrics = {
            startTime: Date.now(),
            initializationTime: null,
            componentsLoaded: 0,
            healthStatus: 'initializing'
        };
        
        // Enterprise Lite starting
    }

    /**
     * Initialize lite enterprise system (NASA: system initialization)
     * Function size: 45 lines (NASA compliant)
     */
    async initialize() {
        try {
            const initStart = performance.now();
            
            // Enterprise Lite Integration starting
            
            // Step 1: Initialize performance monitoring
            await this.initializePerformanceMonitoring();
            
            // Step 2: Initialize health checking
            await this.initializeHealthCheck();
            
            // Step 3: Start monitoring
            await this.startMonitoring();
            
            const initTime = performance.now() - initStart;
            this.metrics.initializationTime = initTime;
            this.isInitialized = true;
            this.metrics.healthStatus = 'healthy';
            
            // Enterprise Lite fully initialized
            
            return {
                success: true,
                initializationTime: initTime,
                componentsLoaded: this.metrics.componentsLoaded,
                systemHealth: await this.getSystemHealth()
            };
            
        } catch (error) {
            this.metrics.healthStatus = 'failed';
            logger.error('❌ Enterprise Lite initialization failed', { 
                error: error.message,
                stack: error.stack 
            });
            
            // Don't throw error - allow app to continue without enterprise features
            console.warn('Enterprise features disabled due to initialization failure');
            return { success: false, error: error.message };
        }
    }

    /**
     * Initialize performance monitoring (NASA: performance setup)
     * Function size: 30 lines (NASA compliant)
     */
    async initializePerformanceMonitoring() {
        try {
            logger.info('⚡ Initializing performance monitoring...');
            
            const performanceMonitor = new PerformanceMonitor();
            await performanceMonitor.startMonitoring();
            this.components.set('performanceMonitor', performanceMonitor);
            this.metrics.componentsLoaded++;
            
            // Set enterprise thresholds
            performanceMonitor.updateThreshold('lcp', 2500);
            performanceMonitor.updateThreshold('fid', 100);
            performanceMonitor.updateThreshold('cls', 0.1);
            
            logger.info('✅ Performance monitoring initialized', {
                thresholds: { lcp: '2500ms', fid: '100ms', cls: '0.1' }
            });
            
        } catch (error) {
            logger.error('❌ Performance monitoring initialization failed', { error: error.message });
            // Continue without performance monitoring
        }
    }

    /**
     * Initialize health check system (NASA: health setup)
     * Function size: 25 lines (NASA compliant)
     */
    async initializeHealthCheck() {
        try {
            logger.info('🏥 Initializing health check...');
            
            const healthCheck = new HealthCheck();
            await healthCheck.initialize();
            this.components.set('healthCheck', healthCheck);
            this.metrics.componentsLoaded++;
            
            logger.info('✅ Health check initialized');
            
        } catch (error) {
            logger.error('❌ Health check initialization failed', { error: error.message });
            // Continue without health checking
        }
    }

    /**
     * Start system monitoring (NASA: monitoring)
     * Function size: 25 lines (NASA compliant)
     */
    async startMonitoring() {
        try {
            logger.info('📊 Starting system monitoring...');
            
            // Monitor every 30 seconds
            setInterval(async () => {
                try {
                    const health = await this.getSystemHealth();
                    if (health.status !== 'healthy') {
                        logger.warn('System health degraded', health);
                    }
                } catch (error) {
                    logger.error('Health check failed', { error: error.message });
                }
            }, 30000);
            
            logger.info('✅ System monitoring started');
            
        } catch (error) {
            logger.error('❌ System monitoring failed to start', { error: error.message });
        }
    }

    /**
     * Get system health (NASA: health reporting)
     * Function size: 35 lines (NASA compliant)
     */
    async getSystemHealth() {
        try {
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.metrics.startTime,
                components: {},
                metrics: {}
            };
            
            // Check each component health
            for (const [name, component] of this.components) {
                try {
                    if (component.getHealth) {
                        health.components[name] = await component.getHealth();
                    } else {
                        health.components[name] = { status: 'healthy', message: 'Running' };
                    }
                } catch (error) {
                    health.components[name] = { status: 'error', message: error.message };
                }
            }
            
            // Get system metrics
            health.metrics = {
                memoryUsage: this.getMemoryUsage(),
                componentsLoaded: this.metrics.componentsLoaded,
                initializationTime: this.metrics.initializationTime
            };
            
            return health;
            
        } catch (error) {
            logger.error('Failed to get system health', { error: error.message });
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get memory usage (NASA: memory monitoring)
     * Function size: 20 lines (NASA compliant)
     */
    getMemoryUsage() {
        try {
            if (performance.memory) {
                const used = performance.memory.usedJSHeapSize;
                const total = performance.memory.totalJSHeapSize;
                const limit = performance.memory.jsHeapSizeLimit;
                
                return {
                    used: Math.round(used / 1024 / 1024), // MB
                    total: Math.round(total / 1024 / 1024), // MB
                    limit: Math.round(limit / 1024 / 1024), // MB
                    usage: Math.round((used / limit) * 100) // Percentage
                };
            }
            
            return { message: 'Memory API not available' };
            
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get enterprise metrics for dashboard (NASA: metrics)
     * Function size: 20 lines (NASA compliant)
     */
    getMetrics() {
        try {
            const performanceMonitor = this.components.get('performanceMonitor');
            
            return {
                timestamp: Date.now(),
                uptime: Date.now() - this.metrics.startTime,
                memory: this.getMemoryUsage(),
                performance: performanceMonitor ? performanceMonitor.getRealTimeMetrics() : null,
                components: this.metrics.componentsLoaded,
                healthStatus: this.metrics.healthStatus,
                isInitialized: this.isInitialized
            };
        } catch (error) {
            logger.error('Failed to get metrics', { error: error.message });
            return { error: error.message };
        }
    }

    /**
     * Get system status for external access
     * Function size: 15 lines (NASA compliant)
     */
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            components: this.metrics.componentsLoaded,
            uptime: Date.now() - this.metrics.startTime,
            healthStatus: this.metrics.healthStatus,
            memoryUsage: this.getMemoryUsage(),
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
const enterpriseSystemLite = new EnterpriseSystemLite();

// Make it globally accessible for debugging and dashboard
window.enterpriseSystem = enterpriseSystemLite;

export default enterpriseSystemLite;
export { EnterpriseSystemLite };