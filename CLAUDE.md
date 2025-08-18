# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a digital menu system for restaurants with an administrative panel. It's a static site that uses localStorage for data persistence and can be deployed to Netlify.

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6+ modules, HTML5, CSS3
- **CSS Framework**: Tailwind CSS (via CDN)
- **Architecture**: MVC pattern with modular JavaScript
- **Data Storage**: localStorage API
- **Deployment**: Netlify (static hosting)
- **Authentication**: Session-based with sessionStorage

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

### Core Data Flow
1. **Database Layer** (`src/js/database.js`): Manages all localStorage operations
2. **Controllers**: Handle business logic and coordinate between views and database
3. **Views**: Render UI components and handle DOM updates
4. **Main Apps**: `app.js` (public menu) and `admin.js` (admin panel)

### Key Components

- **Database** (`database.js`): Central data management with methods for:
  - Products CRUD with ordering and featured status
  - Categories with drag-and-drop ordering
  - Gallery image management
  - Authentication and session handling
  - Export/import backup functionality

- **Admin Panel** (`admin.html`):
  - Dashboard with statistics
  - Product management with image upload
  - Category management with reordering
  - Settings and backup/restore
  - Default credentials: `admin` / `admin123`

- **Public Menu** (`index.html`):
  - Responsive category navigation
  - Real-time search
  - Featured products display
  - Dynamic pricing with sale support

### Data Schema

Products include:
- Basic: id, name, description, price, image
- Features: active, featured, tags, order
- Sale: originalPrice, isOnSale
- Metadata: categoryId, createdAt

Categories include:
- id, name, order, active, displayOrder

## Important Patterns

### Image Handling
- Images stored as base64 in localStorage (5MB limit per image)
- Gallery system for reusable images
- Automatic tagging and categorization
- Support for JPG, PNG, WebP, SVG formats

### Product Ordering
- Products ordered by: featured status → category order → product order → creation date
- Categories support drag-and-drop reordering
- Each product has an order field within its category

### Authentication
- Simple username/password stored in localStorage
- Session expires after 4 hours
- Uses sessionStorage for auth state

## Development Notes

### localStorage Limitations
- ~5-10MB total storage per domain
- Data persists only in browser
- No cross-device sync
- Clear browser data = lose all data

### Netlify Configuration
- Redirects configured for SPA-like routing
- Security headers applied
- Cache optimization for assets
- Build command is a no-op (static site)

### File Structure Conventions
- Controllers in `src/js/controllers/`
- Views in `src/js/views/`
- Main entry points: `app.js` (menu), `admin.js` (admin)
- Styles separated: `main.css` (menu), `admin.css` (admin)

## Common Tasks

### Add New Product Feature
1. Update schema in `database.js` initialization
2. Add field to product form in admin view
3. Update product controller to handle new field
4. Display in menu view if needed

### Deploy to Production
```bash
git add .
git commit -m "Your changes"
git push origin main
# Netlify auto-deploys from main branch
```

### Create Data Backup
1. Access admin panel → Settings
2. Click "Export Data"
3. Save JSON file locally

### Restore from Backup
1. Access admin panel → Settings
2. Select backup JSON file
3. Click "Import Data"

## Security Considerations
- Admin password stored in plain text (prototype only)
- No server-side validation
- All data client-side accessible
- CORS not applicable (static site)
- XSS protection via proper escaping