# Technology Stack

## Architecture
Marketing Maps follows a modern full-stack architecture using the Betterz Stack (a variant of the T3 stack) with a focus on type safety, performance, and developer experience.

## Frontend
- **Framework**: React 19.1.1 with modern hooks and features
- **Routing**: TanStack Router for file-based, type-safe routing
- **State Management**: Redux Toolkit with React bindings
- **Data Fetching**: TanStack Query for server state management
- **Forms**: TanStack Form for form state management
- **UI Components**: shadcn/ui components built with Radix UI and Tailwind CSS
- **Styling**: Tailwind CSS v4 for utility-first styling
- **Icons**: Lucide React icon library
- **Maps**: Leaflet with heatmap and marker cluster plugins
- **Internationalization**: Lingui for type-safe i18n
- **Build Tool**: Vite 7.1.1 for fast development and production builds
- **Package Manager**: Bun 1.2.15 for fast dependency management

## Backend
- **Runtime**: Bun for JavaScript/TypeScript execution
- **Database**: PostgreSQL with Docker containerization
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management
- **API Layer**: oRPC for type-safe API creation with OpenAPI support
- **Authentication**: Better Auth for secure authentication with OAuth support
- **Testing**: Vitest for unit and integration testing

## Development Environment
- **Language**: TypeScript 5.9.2 for type safety
- **Linting/Formatting**: Biome 2.1.2 for ultra-fast code quality tools
- **Runtime**: Bun 1.2.15 (faster than Node.js for development)
- **Containerization**: Docker for database and service management

## Common Commands
```bash
# Development
bun dev                # Start development server
bun build              # Build for production
bun check-types        # TypeScript type checking
bun check              # Lint and format with Biome
bun clean              # Clean all build artifacts

# Database
bun db:start           # Start PostgreSQL container
bun db:push            # Push schema to database
bun db:studio          # Open Drizzle Studio (database GUI)
bun db:generate        # Generate migration files
bun db:migrate         # Run database migrations

# Testing
bun test               # Run Vitest tests

# Internationalization
bun lingui:extract     # Extract translatable strings from code
bun lingui:compile     # Compile translations for production
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: 32+ character secret for authentication
- `BETTER_AUTH_URL`: Authentication domain (default: http://localhost:3000)
- `CORS_ORIGIN`: CORS allowed origin
- OAuth provider IDs and secrets (GitHub, Google)
- `VITE_APP_TITLE`: Application title

## Port Configuration
- **Application Server**: Port 3000 (configured in vite.config.ts)
- **Database**: Port 5432 (PostgreSQL in Docker, mapped in docker-compose.yml)