# Metamorfose Vital Landing Page

## Overview

This is a landing page for "Metamorfose Vital," a health and wellness program focused on weight loss and nutrition. The application is designed to capture leads through call-to-action buttons and showcase the program's features, benefits, and transformation results. The landing page follows a pixel-perfect design approach based on reference materials, featuring sections for hero content, target audience transformation photos, program pillars, course modules, and bonuses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool and development server.

**Routing**: The application uses Wouter for lightweight client-side routing, with a simple route structure (home page and 404 not-found page).

**UI Component Library**: Shadcn UI components built on Radix UI primitives, providing accessible and customizable React components. The design system uses the "new-york" style variant with Tailwind CSS for styling.

**State Management**: React Query (TanStack Query) handles server state management for API calls, with custom query client configuration that disables automatic refetching and sets infinite stale time.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form management, particularly for the lead capture dialog.

**Design System**: 
- Tailwind CSS with custom configuration extending the base theme
- Custom CSS variables for theming (light mode defined)
- Typography system using Montserrat (headings) and Open Sans (body text)
- Consistent spacing system (4, 6, 8, 12, 16, 24 Tailwind units)
- Component-specific design guidelines for hero section, audience section, pillars, modules, and bonus sections

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**API Design**: RESTful API endpoints:
- `POST /api/leads` - Create new lead captures
- `GET /api/leads` - Retrieve all leads (for future admin panel)

**Data Storage**: In-memory storage implementation (`MemStorage` class) using JavaScript Map for temporary lead storage. The architecture is designed to be easily replaceable with a persistent database solution through the `IStorage` interface.

**Validation**: Zod schemas shared between client and server for consistent validation. Lead schema validates name (minimum 2 characters), email format, and optional phone number.

**Development Setup**: Custom Vite middleware integration for hot module replacement during development. The server proxies Vite's dev server and handles SSR template rendering.

### Build and Deployment

**Build Process**: 
- Client: Vite builds React application to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js` as ESM module
- Separate build commands maintain clear separation between client and server builds

**Scripts**:
- `dev`: Development mode with tsx for TypeScript execution
- `build`: Production build for both client and server
- `start`: Production server execution
- `db:push`: Drizzle Kit push for database migrations (prepared for future database integration)

### External Dependencies

**Database (Configured but Not Active)**:
- Drizzle ORM configured for PostgreSQL
- Neon Database serverless driver included in dependencies
- Database schema and migration setup prepared in `shared/schema.ts` and `drizzle.config.ts`
- Environment variable `DATABASE_URL` expected for database connection

**UI Component Library**:
- Radix UI primitives for 20+ accessible component types (accordion, dialog, dropdown, navigation, etc.)
- Embla Carousel for image/content carousels
- Lucide React for iconography

**Development Tools**:
- Replit-specific plugins for development: runtime error modal, cartographer, and dev banner
- PostCSS with Tailwind CSS and Autoprefixer for styling

**Styling**:
- Tailwind CSS with custom theme configuration
- class-variance-authority for component variant management
- clsx and tailwind-merge for conditional class composition

**Form and Validation**:
- React Hook Form for form state management
- Zod for schema validation
- @hookform/resolvers for integrating Zod with React Hook Form

**Date Handling**: date-fns library for date manipulation and formatting

**Session Management**: connect-pg-simple for PostgreSQL session storage (prepared for when database is active)

**Notes**: 
- The application has Drizzle ORM configured but may not be using PostgreSQL actively yet
- Lead capture currently uses in-memory storage, designed to be swapped for database persistence
- All necessary database configuration is in place for easy migration to PostgreSQL when needed