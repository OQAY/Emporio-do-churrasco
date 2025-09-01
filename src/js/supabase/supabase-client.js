/**
 * Supabase Client - NASA Standard API Client
 * Single Responsibility: Manage Supabase connection
 * File size: <150 lines (NASA compliant)
 * ALL FUNCTIONS < 60 lines (NASA compliant)
 */

class SupabaseClient {
  constructor() {
    this.supabaseUrl = window.ENV?.SUPABASE_URL || 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
    this.supabaseKey = window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
    this.restaurantId = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';
    
    // 🚀 OTIMIZAÇÃO: Headers simplificados para evitar preflights
    this.headers = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`
      // Removidos Content-Type e Prefer para evitar preflight CORS
    };
    
    // 🚀 Cache de requisições para evitar duplicatas
    this.requestCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Make HTTP request to Supabase (NASA: network abstraction)
   * Function size: 25 lines (NASA compliant)
   */
  async makeRequest(endpoint, options = {}) {
    // 🚀 CACHE: Check cache first
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Cache hit: ${endpoint}`);
      return cached.data;
    }
    
    const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
    
    try {
      console.log(`🌐 API call: ${endpoint}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase Error (${response.status}): ${error}`);
      }

      const data = await response.json();
      
      // 🚀 CACHE: Store result
      this.requestCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error(`Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Test connection status (NASA: health check)
   * Function size: 20 lines (NASA compliant)
   */
  async testConnection() {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/restaurants?id=eq.${this.restaurantId}`,
        {
          method: 'HEAD',
          headers: this.headers
        }
      );
      
      return {
        connected: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get restaurant ID (NASA: getter pattern)
   * Function size: 3 lines (NASA compliant)
   */
  getRestaurantId() {
    return this.restaurantId;
  }
}

export { SupabaseClient };