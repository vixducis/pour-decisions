# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Laravel + React application using Inertia.js for full-stack development:

- **Backend**: Laravel 12 with PHP 8.2+, using SQLite database
- **Frontend**: React 19 with TypeScript, using Inertia.js for seamless SPA experience
- **Styling**: Tailwind CSS v4 with Radix UI components and custom UI components
- **Build Tool**: Vite with Laravel Vite plugin
- **Testing**: Pest (PHP) for backend tests, located in `tests/Feature` and `tests/Unit`

### Key Directory Structure

- `app/Http/Controllers/` - Laravel controllers organized by feature (Auth/, Settings/)
- `resources/js/pages/` - React page components mapped to Laravel routes
- `resources/js/components/` - Reusable React components with `ui/` subfolder for design system
- `resources/js/layouts/` - Layout components for different page types (app/, auth/, settings/)
- `resources/js/hooks/` - Custom React hooks
- `routes/` - Laravel routes split by feature (web.php, auth.php, settings.php)

### Inertia.js Integration

- Pages are resolved from `resources/js/pages/` directory
- Shared data is configured in `app/Http/Middleware/HandleInertiaRequests.php`
- Routes use `Inertia::render()` to return React components
- Ziggy integration provides Laravel route helpers in JavaScript

## Development Commands

### Backend (PHP/Laravel)
- `composer dev` - Start full development environment (server, queue, logs, vite)
- `composer dev:ssr` - Start with server-side rendering
- `composer test` - Run Pest test suite
- `php artisan serve` - Start Laravel development server
- `php artisan test` - Run tests directly
- `vendor/bin/pint` - Run Laravel Pint code formatter
- 'vendor/bin/phpstan' - Run PHPStan for code checking

### Frontend (JavaScript/TypeScript)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:ssr` - Build with SSR support
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run types` - Run TypeScript type checking

### Database
- `php artisan migrate` - Run database migrations
- Database file: `database/database.sqlite`

## Code Style & Patterns

### React Components
- Use TypeScript throughout
- Components follow shadcn/ui patterns with class-variance-authority
- Custom hooks in `hooks/` directory (use-appearance, use-mobile, etc.)
- Consistent use of Radix UI primitives for interactive elements

### Laravel Structure
- Controllers organized by feature areas
- Middleware includes appearance handling and Inertia request processing
- Routes split into logical files (auth.php, settings.php, web.php)
- Uses Laravel's built-in authentication with email verification

### Styling
- Tailwind CSS v4 with custom design tokens
- Component variants using class-variance-authority
- Dark/light mode support via appearance system
- Consistent spacing and typography patterns

## Testing
- Backend tests use Pest framework
- Feature tests cover authentication flows and main functionality
- Test database uses in-memory SQLite
- Run single test: `php artisan test --filter TestName`