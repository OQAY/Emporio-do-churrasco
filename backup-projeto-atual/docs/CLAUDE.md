# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an enterprise-grade digital menu system for restaurants with advanced administrative capabilities. The system supports dual architecture: a static site with localStorage persistence AND enterprise integration with Supabase backend, performance monitoring, and NASA-compliant coding standards.

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6+ modules, HTML5, CSS3
- **CSS Framework**: Tailwind CSS (via CDN)
- **Architecture**: Layered MVC with enterprise components
- **Data Storage**: Dual-mode (localStorage + Supabase integration)
- **Backend**: Supabase (optional, enterprise mode)
- **Deployment**: Netlify (static hosting)
- **Authentication**: Session-based with sessionStorage
- **Monitoring**: Enterprise performance monitoring and health checks
- **Standards**: NASA coding standards (functions <60 lines, files <400 lines)

## Key Commands

```bash
# Development server (port 8080)
npm run dev

# Start server (alias for dev)
npm run start

# Build (no-op for static site)
npm run build
```

## Project Architecture

### Dual-Mode Architecture
The system operates in two modes:
- **Public Mode** (`app.js`): Optimized for fast loading, only loads public data
- **Admin Mode** (`admin.js`): Full enterprise features with complete data access

### Enterprise Data Flow (NASA Standard)
1. **Database Layer**: 
   - `database-nasa.js`: Main orchestrator following NASA standards
   - `database.js`: Legacy localStorage fallback
2. **Supabase Integration** (`src/js/supabase/`):
   - `supabase-client.js`: Connection management
   - `data-fetcher.js`: Optimized data retrieval
   - `data-transformer.js`: Data formatting and validation
   - `cache-manager.js`: Intelligent caching layer
   - `data-writer.js`: Safe data persistence
3. **Enterprise System** (`enterprise-system-lite.js`):
   - Performance monitoring
   - Health checks
   - System metrics
4. **Controllers**: Business logic coordination
5. **Views**: UI rendering with lazy loading optimization
6. **Core Services**:
   - `lazy-loader.js`: Image and content lazy loading
   - `logger.js`: Enterprise logging
   - `performance-monitor.js`: Real-time performance tracking

### Key Components

- **Enterprise Database** (`database-nasa.js`): NASA-compliant data orchestrator with:
  - Dual-mode operation (public/admin)
  - Supabase integration with fallback to localStorage
  - Performance optimization and caching
  - Enterprise error handling and logging

- **Legacy Database** (`database.js`): Fallback localStorage operations:
  - Products CRUD with ordering and featured status
  - Categories with drag-and-drop ordering
  - Gallery image management
  - Authentication and session handling
  - Export/import backup functionality

- **Admin Panel** (`admin.html`):
  - Enterprise dashboard with real-time metrics
  - Advanced product management with tag system
  - Category management with reordering
  - Performance monitoring console
  - Settings and backup/restore
  - Default credentials: `admin` / `admin123`

- **Public Menu** (`index.html`):
  - Optimized responsive navigation
  - Real-time search with performance tracking
  - Featured products with lazy loading
  - Enterprise caching and performance optimization

### Data Schema

Products include:
- Basic: id, name, description, price, image
- Features: active, featured, tags, order
- Sale: originalPrice, isOnSale
- Metadata: categoryId, createdAt

Categories include:
- id, name, order, active, displayOrder

## Important Patterns

### NASA Coding Standards
- All functions must be <60 lines (NASA JPL Rule #2)
- Files must be <400 lines for maintainability
- Single responsibility principle enforced
- Comprehensive error handling and logging

### Dual-Mode Data Loading
- **Public Mode**: `database.loadPublicData()` - Fast, optimized for menu display
- **Admin Mode**: `database.loadFullData()` - Complete dataset with enterprise features
- Automatic fallback from Supabase to localStorage

### Enterprise Image Handling
- Base64 storage with intelligent caching
- Lazy loading with skeleton placeholders
- Performance-optimized image rendering
- Gallery system with automatic categorization
- Support for JPG, PNG, WebP, SVG formats

### Performance Optimization
- Lazy loading for images and content
- Intelligent caching layer
- Performance monitoring and metrics
- Health checks and circuit breakers
- Resource optimization

### Product Ordering & Tags
- Advanced ordering: featured → category → product order → creation date
- Enterprise tag system with instant preview
- Drag-and-drop category reordering
- Real-time product filtering and search

### Authentication & Security
- Session-based auth with 4-hour expiration
- Enterprise logging for security events
- Input sanitization and validation
- CSRF protection headers via Netlify

## Development Notes

### Enterprise vs Legacy Architecture
- **Enterprise**: Use `database-nasa.js` with Supabase integration
- **Legacy**: Fallback to `database.js` with localStorage only
- System automatically determines which mode to use
- Enterprise features include monitoring, caching, and performance optimization

### Testing and Debugging
- `/debug/` folder contains comprehensive testing files
- Performance comparison tools available
- Enterprise dashboard for real-time monitoring
- Debug console for troubleshooting integration issues

### Supabase Integration
- Optional backend with automatic fallback
- Real-time data synchronization when available
- Optimized queries for performance
- Enterprise-grade security and caching

### localStorage Limitations (Legacy Mode)
- ~5-10MB total storage per domain
- Data persists only in browser
- No cross-device sync
- Clear browser data = lose all data

### Netlify Configuration
- Redirects configured for SPA-like routing
- Enterprise security headers applied
- Advanced cache optimization for performance
- Build command optimized for static deployment

### File Structure Conventions
- **Enterprise Core**: `src/js/core/` (logging, health, monitoring)
- **Supabase Layer**: `src/js/supabase/` (data services)
- **Performance**: `src/js/performance/` (optimization modules)
- **Services**: `src/js/services/` (lazy loading, utilities)
- **Controllers**: `src/js/controllers/` (business logic)
- **Views**: `src/js/views/` (UI components)
- **Main Apps**: `app.js` (public), `admin.js` (enterprise)
- **Debugging**: `/debug/` (testing and validation tools)

## Common Tasks

### Add New Enterprise Feature
1. Follow NASA standards (functions <60 lines, files <400 lines)
2. Update schema in `database-nasa.js` or relevant Supabase module
3. Add comprehensive error handling and logging
4. Update data transformer for new field validation
5. Test in both enterprise and legacy modes
6. Add performance monitoring if needed

### Test Performance Optimization
1. Use files in `/debug/` folder for testing
2. Check `test-performance-comparison.html` for benchmarks
3. Monitor enterprise dashboard for real-time metrics
4. Validate lazy loading with `test-lazy-loading.html`

### Deploy to Production
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify auto-deploys from main branch
```

### Debug Enterprise Integration
1. Check enterprise dashboard at `/admin.html`
2. Use debug console in `/debug/` files
3. Monitor performance metrics in real-time
4. Check health status and error logs

### Create Enterprise Backup
1. Access admin panel → Settings
2. Click "Export Data" (includes both localStorage and Supabase data)
3. Save JSON file with enterprise metadata

### Test Supabase Integration
1. Use `/debug/test-supabase-integration.html`
2. Verify data fetching and caching
3. Test fallback to localStorage mode
4. Monitor performance metrics

## Security Considerations

### Enterprise Security Features
- Advanced input sanitization in data transformer
- Comprehensive logging of security events
- Enterprise headers via Netlify (X-Frame-Options, XSS Protection)
- CSRF protection through proper header configuration
- Secure session management with enterprise monitoring

### Legacy Security (localStorage mode)
- Admin password stored in plain text (prototype only)
- Client-side validation with sanitization
- XSS protection via proper escaping
- Session timeout management

### Data Security
- Supabase integration includes row-level security (RLS)
- Automatic data validation and transformation
- Enterprise logging for audit trails
- Secure backup and restore procedures

## NASA Standards Compliance

### Code Quality Standards
- All functions limited to <60 lines (NASA JPL Rule #2)
- Files limited to <400 lines for maintainability
- Single responsibility principle enforced
- Comprehensive error handling required
- Extensive logging for debugging and monitoring

### Documentation Requirements
- Function documentation with purpose and parameters
- Enterprise system monitoring and health checks
- Performance metrics and optimization tracking
- Clear separation of concerns between modules