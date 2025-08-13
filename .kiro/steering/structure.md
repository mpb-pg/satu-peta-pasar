# Project Structure

## Root Directory Organization
```
.
├── .git/                    # Git version control
├── .github/                 # GitHub configurations and workflows
├── .kiro/                   # Kiro framework configurations
│   └── steering/            # Steering documentation (this directory)
├── apps/                    # Application workspaces
│   └── web/                 # Main web application
├── packages/                # Shared packages and libraries
└── node_modules/            # Project dependencies
```

## Web Application Structure (`apps/web/`)
```
apps/web/
├── src/                     # Source code
│   ├── components/          # Shared UI components
│   │   ├── ui/              # shadcn/ui components (buttons, cards, etc.)
│   │   └── header.tsx       # Header component
│   ├── lib/                 # Infrastructure and utilities
│   │   ├── auth/            # Better Auth configuration
│   │   ├── db/              # Database schema and connections
│   │   ├── lingui/          # Internationalization setup
│   │   ├── orpc/            # oRPC API configuration
│   │   └── utils.ts         # Utility functions
│   ├── routes/              # Feature modules (TanStack Router structure)
│   │   ├── __root.tsx       # Root route layout
│   │   ├── index.tsx        # Home page
│   │   ├── dashboard.tsx    # Dashboard page
│   │   ├── auth/            # Authentication routes
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── map/             # Marketing map functionality
│   │   └── ...              # Other feature routes
│   ├── client.tsx           # Client entry point
│   ├── env/                 # Environment variable schemas
│   ├── router.tsx           # Router configuration
│   └── routeTree.gen.ts     # Generated route tree
├── public/                  # Static assets
├── .kiro/                   # Kiro configurations for web app
├── node_modules/            # Web app dependencies
├── package.json             # Web app package configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

## Code Organization Patterns

### Clean Architecture Implementation
Marketing Maps follows a variant of Clean Architecture principles:
1. **Presentation Layer** (`components/`, route components) - UI rendering
2. **Application Layer** (`-app/` directories within features) - Business logic orchestration
3. **Domain Layer** (`-domain/` directories within features) - Core business rules and entities
4. **Infrastructure Layer** (`lib/` directories) - External services and technical implementations

### Feature-Based Organization
Features are organized in dedicated directories under `src/routes/`:
- Each feature gets its own directory (e.g., `auth/`, `map/`)
- Features may contain subdirectories:
  - `-app/` - Application layer logic (business logic adapters)
  - `-domain/` - Domain entities and validation
  - `-components/` - Feature-specific UI components
  - `-hooks/` - Feature-specific React hooks
  - `-locales/` - Feature-specific translations

### Internationalization Structure
- **Global Translations**: `src/locales/` directory with feature-prefixed files
- **Feature Translations**: Individual feature directories may contain `-locales/` subdirectories
- **Translation Format**: JSON files with message IDs prefixed by feature name

## File Naming Conventions

### Route Files
- Route files follow TanStack Router conventions in `src/routes/`
- Index routes named `index.tsx`
- Nested routes grouped in subdirectories
- Parameterized routes use `$param.tsx` naming

### Component Files
- React components use PascalCase naming (e.g., `TodoList.tsx`)
- Component files end with `.tsx` extension
- Shared UI components in `components/ui/` follow shadcn naming
- Feature-specific components in feature directories

### Library and Utility Files
- Utilities named with kebab-case (e.g., `utils.ts`)
- Library files in `lib/` directories
- Configuration files follow the pattern `{name}.config.ts`

### Translation Files
- Translation files follow `{locale}.po` naming convention
- Feature-specific translations prefixed with feature name
- Global translations in `src/locales/` directory

## Import Organization

### Internal Imports
- Absolute imports preferred using project alias `@/`
- Components imported from `@/components/{component-name}`
- Utilities imported from `@/lib/utils`
- Feature modules imported from `@/routes/{feature-name}`

### External Imports
- Dependencies managed through Bun package manager
- Type-only imports marked with `type` keyword
- Default imports for libraries when available
- Named imports for specific functions/components

## Key Architectural Principles

### Type Safety
- TypeScript used throughout the stack
- Zod schemas for runtime validation
- End-to-end type safety from database to frontend
- Strict type checking with `"strict": true` in tsconfig

### Modularity
- Feature-first organization
- Reusable components in shared directories
- Separation of concerns between layers
- Independent route modules

### Developer Experience
- Bun for fast package management and runtime
- Vite for instant hot module replacement
- Biome for ultra-fast linting and formatting
- TanStack Router for file-based routing with types
- oRPC for type-safe API contracts