# Allergy Tracker Mobile Application

## Overview

This is a mobile-first web application built for tracking allergies and managing related expenses. The application provides a comprehensive dashboard for users to monitor their allergy management, track expenses, manage roommates, and split bills related to allergy-safe purchases.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

The application follows a mobile-first design approach with a maximum width container (max-w-md) and includes bottom navigation for mobile-friendly user experience.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Development**: Hot module replacement with Vite middleware integration

### Key Components

#### Database Schema
The application uses six main entities:
- **Users**: Basic user authentication and identification
- **Allergies**: User's allergy information with severity and risk levels
- **Expenses**: Expense tracking with allergy-safe categorization
- **Roommates**: Roommate management for bill splitting
- **Bill Splits**: Collaborative expense sharing functionality
- **Accounts**: Financial account management (bank, cash, credit, savings) with balance tracking
- **Activities**: Activity logging for user engagement tracking

#### UI Components
- Custom component library based on Radix UI primitives
- Responsive design with mobile-optimized navigation
- Form components with validation and error handling
- Modal dialogs for data entry
- Floating action button for quick expense addition

#### Pages and Features
- **Dashboard**: Overview of allergies, expenses, recent activities, account balances, and balance trends
- **Analytics**: Data visualization and spending analysis
- **Allergies**: Management of user's allergy information
- **Expenses**: Expense tracking with allergy-safe filtering
- **Roommates**: Roommate management and bill splitting with improved UI using plus icons
- **Account Management**: Add and manage multiple accounts (bank, cash, credit, savings) with balance tracking

## Data Flow

1. **Client Requests**: React components use React Query to fetch data from API endpoints
2. **API Processing**: Express.js routes handle requests and interact with the storage layer
3. **Data Storage**: In-memory storage implementation (MemStorage) serves as a development placeholder
4. **Database Integration**: Drizzle ORM provides type-safe database operations
5. **Response Handling**: API responses are cached and managed by React Query

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database toolkit
- **connect-pg-simple**: PostgreSQL session store

### UI/UX
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Uses Vite development server with HMR
- Express middleware integration for API during development
- Real-time error overlay and debugging tools

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles Express server for Node.js runtime
- Static assets served from `dist/public` directory
- API server runs on Node.js with production optimizations

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Separate development and production configurations
- Session management with PostgreSQL backing store

## Recent Changes

### December 26, 2025
- **User Authentication System**: Added email/password registration and login with bcrypt password hashing
- **Session Management**: Implemented httpOnly cookie-based sessions to secure user sessions across requests
- **Auth Routes**: Created 4 auth endpoints (POST /api/auth/register, /api/auth/login, POST /api/auth/logout, GET /api/auth/me)
- **Frontend Auth Context**: Built AuthProvider for managing user login state across the application
- **Protected Routes**: Added Login, Signup, and Profile pages with route protection for authenticated users
- **Auth Middleware**: Implemented requireAuth middleware to protect API endpoints

- **Stripe Payment Integration**: Added complete payment system with feature flag (BILLING_ENABLED env var)
- **Pricing Page**: Created pricing page with Free and Pro plans side-by-side comparison
- **Billing Endpoints**: Added 3 Stripe routes (POST /api/billing/create-checkout-session, /api/billing/create-portal-session, /api/billing/webhook)
- **User Billing Fields**: Extended users table with plan (free/pro), stripeCustomerId, and subscriptionStatus
- **Stripe Webhooks**: Implemented webhook handler for subscription lifecycle events (created, updated, deleted)
- **Upgrade UI**: Added upgrade buttons in pricing page and profile page with Stripe Checkout integration
- **Subscription Management**: Added manage subscription button for Pro users to access Stripe billing portal

### January 14, 2025
- **Complete "More" Section Redesign**: Transformed roommates page into comprehensive "More" section with tabbed interface
- **Multi-User Support**: Designed for normal persons, students, small business owners, and investment/trading users
- **Tab Structure**: Added four main tabs - Share (group sharing), Invest (investments), Records (transaction records), More (settings & features)
- **Group Sharing**: Renamed roommates to group members with enhanced bill splitting functionality for all user types
- **Investment Features**: Added investment options section for stocks, crypto, and other financial instruments
- **Transaction Records**: Comprehensive records management with export and reporting capabilities
- **Settings & Upgrade**: Premium upgrade options, settings, social media links, help & support
- **Accessibility Improvements**: Added dialog descriptions to fix accessibility warnings

### January 13, 2025
- **Account Management System**: Added comprehensive account management with support for bank accounts, cash, credit cards, and savings accounts
- **Balance Overview Widget**: Implemented total balance tracking and display on dashboard with gradient card design
- **Account Cards Grid**: Created responsive account cards showing individual account balances with appropriate icons
- **Add Account Modal**: Built form-based account creation with type selection and balance initialization
- **API Integration**: Added full CRUD operations for accounts with proper validation
- **UI Improvements**: Changed roommate section "Add" buttons to circular plus icons for better visual consistency
- **Navigation Fix**: Resolved React DOM nesting warning in bottom navigation component

## Environment Variables

### Billing Configuration (Optional - set these to enable Stripe)
- `BILLING_ENABLED`: Set to "true" to enable Stripe billing features
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (frontend checkout)
- `STRIPE_SECRET_KEY`: Your Stripe secret key (backend processing)
- `STRIPE_PRO_PRICE_ID`: Stripe price ID for Pro plan (format: price_xxx)
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe dashboard

### Webhook URL
When Stripe is enabled, configure webhooks at: `https://your-domain.com/api/billing/webhook`

Listen for these events:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

The application architecture supports easy scaling from the current in-memory storage to full database persistence, with clear separation between the storage interface and implementation details.