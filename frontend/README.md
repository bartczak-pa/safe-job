# Safe Job Platform - Frontend

A modern React 19 + TypeScript frontend for the Safe Job Platform, connecting legitimate hiring agencies with temporary workers in the Netherlands.

## ✨ Project Overview

The Safe Job Platform frontend provides a secure, mobile-first interface for job seekers and employers to connect safely. Built with modern web technologies, it emphasizes user experience, security, and accessibility.

### Key Features

- 🔐 **Magic Link Authentication** - Passwordless, secure login system
- 📱 **Mobile-First Design** - Responsive interface optimized for all devices
- 🎨 **Modern UI/UX** - Clean design with Tailwind CSS and custom components
- ⚡ **Fast Performance** - Vite build system with hot module replacement
- 🛡️ **Type Safety** - Full TypeScript integration with strict mode
- 🧪 **Comprehensive Testing** - Jest + React Testing Library with high coverage

## 📊 Status

✅ All frontend tests and linting checks are passing
✅ Production-ready with Nginx configuration
✅ Docker integration with hot reload support

## 🏗️ Technology Stack

### Core Technologies

- **React 19**: Latest React with modern features and concurrent rendering
- **TypeScript**: Full type safety with strict configuration
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom design system

### State Management & Data

- **Zustand**: Lightweight state management for global app state
- **React Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant forms with built-in validation
- **React Router**: Client-side routing with protected routes

### Development & Testing

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **Vite Plugins**: React Fast Refresh, TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (for local development)
- Docker Desktop (for containerized development)

### Option 1: Docker Development (Recommended)

```bash
# Start the entire Safe Job Platform stack
make dev

# Frontend will be available at:
# - Development: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/api/schema/swagger-ui/
```

### Option 2: Local Development

```bash
# Clone the repository
git clone <repository-url>
cd safe-job/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with hot reload |
| `npm run build`        | Build for production                     |
| `npm run preview`      | Preview production build locally         |
| `npm run test`         | Run unit tests                           |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run lint`         | Run ESLint linting                       |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check code formatting                    |
| `npm run type-check`   | Run TypeScript type checking             |

## 🎨 Design System

The frontend uses a cohesive design system built with Tailwind CSS:

### Color Palette

```css
/* Primary Colors */
primary-50: #eff6ff   /* Light blue backgrounds */
primary-500: #3b82f6  /* Primary brand color */
primary-600: #2563eb  /* Primary hover states */
primary-700: #1d4ed8  /* Primary active states */

/* Secondary Colors */
secondary-500: #64748b /* Secondary text and UI elements */
secondary-600: #475569 /* Secondary hover states */
```

### Typography

- **Font Family**: Inter (loaded via Google Fonts)
- **Base Size**: 16px with responsive scaling
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components

Reusable components follow consistent patterns:

```typescript
// Example Button component
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

## 🔐 Authentication Flow

The frontend implements a secure magic link authentication system:

1. **Email Input**: User enters email address
2. **Magic Link**: Backend sends secure link via email
3. **Token Verification**: Frontend validates token and creates session
4. **JWT Management**: Secure token storage with automatic refresh
5. **Protected Routes**: Role-based access control

```typescript
// Authentication store structure
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

## 📱 Responsive Design

Mobile-first approach with Tailwind CSS breakpoints:

- **sm**: 640px+ (Small tablets)
- **md**: 768px+ (Tablets)
- **lg**: 1024px+ (Laptops)
- **xl**: 1280px+ (Desktop)
- **2xl**: 1536px+ (Large desktop)

## 🧪 Testing Strategy

### Test Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── ...
├── pages/
│   ├── Login/
│   │   ├── Login.tsx
│   │   └── Login.test.tsx
│   └── ...
```

### Testing Guidelines

- **Component Tests**: Test user interactions, not implementation
- **Integration Tests**: Test complete user flows
- **Accessibility Tests**: Ensure WCAG compliance
- **Coverage Target**: >80% test coverage

## 🚀 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Docker Production

The frontend uses multi-stage Docker builds:

- **Development**: Vite dev server with hot reload
- **Production**: Nginx serving optimized static files

### Environment Variables

```bash
# .env file
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Safe Job Platform"
VITE_ENVIRONMENT=development
```

## 📚 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route-based page components
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── router/            # React Router configuration
├── tests/                 # Test configuration and utilities
├── docker/                # Docker configuration files
└── nginx.conf             # Production Nginx configuration
```

## 🛠️ Development Guidelines

### Code Standards

- **TypeScript**: Use strict mode, define interfaces for all props
- **Components**: One component per file, use functional components
- **Styling**: Use Tailwind CSS classes, avoid inline styles
- **State**: Use Zustand for global state, React hooks for local state
- **Testing**: Write tests for all components and user flows

### Performance Best Practices

- **Code Splitting**: Lazy load pages and heavy components
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Bundle Analysis**: Monitor bundle size with Vite build analysis
- **Image Optimization**: Use appropriate formats and lazy loading

## 🔗 Related Documentation

- [Backend Development Guide](../docs/development/backend.md)
- [Project Architecture](../docs/architecture/architecture.md)
- [Docker Setup Guide](../docs/development/docker.md)
- [Deployment Guide](../docs/development/deployment.md)

---

**Safe Job Platform Frontend** - Built with ❤️ for worker safety and fair employment in the Netherlands.
