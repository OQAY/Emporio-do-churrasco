/**
 * Enterprise-grade slug generation utility
 * Compliance: RFC 3986 (URI Generic Syntax)
 * Supports: Unicode normalization, special character handling
 * NASA Compliant: All functions < 60 lines
 */

export class SlugGenerator {
  /**
   * Generate URL-safe slug from text
   * @param {string} text - Input text to convert
   * @param {Object} options - Configuration options
   * @returns {string} Generated slug
   */
  static generate(text, options = {}) {
    const config = {
      maxLength: 50,
      separator: '-',
      lowercase: true,
      ...options
    };
    
    // Input validation (NASA: defensive programming)
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input: text must be a non-empty string');
    }
    
    return text
      .trim()
      .toLowerCase()
      .normalize('NFD') // Unicode normalization (decompose)
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, config.separator) // Replace spaces with separator
      .replace(new RegExp(`${config.separator}+`, 'g'), config.separator) // Remove duplicate separators
      .replace(new RegExp(`^${config.separator}+|${config.separator}+$`, 'g'), '') // Trim separators from ends
      .substring(0, config.maxLength); // Enforce max length
  }
  
  /**
   * Validate if slug meets enterprise standards
   * @param {string} slug - Slug to validate
   * @returns {boolean} True if valid
   */
  static validate(slug) {
    // RFC 3986 compliant slug pattern
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }
  
  /**
   * Generate unique slug with collision detection
   * @param {string} text - Base text
   * @param {Array} existingSlugs - Array of existing slugs to avoid
   * @returns {string} Unique slug
   */
  static generateUnique(text, existingSlugs = []) {
    let baseSlug = this.generate(text);
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Collision detection and resolution
    while (existingSlugs.includes(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loops (NASA: defensive programming)
      if (counter > 1000) {
        throw new Error('Unable to generate unique slug after 1000 attempts');
      }
    }
    
    return uniqueSlug;
  }
  
  /**
   * Batch generate slugs for multiple inputs
   * @param {Array} texts - Array of text inputs
   * @param {Object} options - Configuration options
   * @returns {Array} Array of generated slugs
   */
  static generateBatch(texts, options = {}) {
    if (!Array.isArray(texts)) {
      throw new Error('Input must be an array of strings');
    }
    
    const generatedSlugs = [];
    
    return texts.map(text => {
      const slug = this.generateUnique(text, generatedSlugs, options);
      generatedSlugs.push(slug);
      return slug;
    });
  }
}

// Export default for backwards compatibility
export default SlugGenerator;