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
The application uses five main entities:
- **Users**: Basic user authentication and identification
- **Allergies**: User's allergy information with severity and risk levels
- **Expenses**: Expense tracking with allergy-safe categorization
- **Roommates**: Roommate management for bill splitting
- **Bill Splits**: Collaborative expense sharing functionality
- **Activities**: Activity logging for user engagement tracking

#### UI Components
- Custom component library based on Radix UI primitives
- Responsive design with mobile-optimized navigation
- Form components with validation and error handling
- Modal dialogs for data entry
- Floating action button for quick expense addition

#### Pages and Features
- **Dashboard**: Overview of allergies, expenses, and recent activities
- **Analytics**: Data visualization and spending analysis
- **Allergies**: Management of user's allergy information
- **Expenses**: Expense tracking with allergy-safe filtering
- **Roommates**: Roommate management and bill splitting

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

The application architecture supports easy scaling from the current in-memory storage to full database persistence, with clear separation between the storage interface and implementation details.