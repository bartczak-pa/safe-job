# Frontend Development Guide

The Safe Job Platform frontend is built with React 19, TypeScript, and modern development tools for a robust, type-safe, and maintainable user interface.

## 🏗️ Technology Stack

### Core Framework

- **React 19**: Latest React version with modern features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Lightning-fast build tool and development server

### Styling & UI

- **Tailwind CSS v3.4**: Utility-first CSS framework
- **Custom Design System**: Consistent colors, spacing, and typography
- **Responsive Design**: Mobile-first approach with breakpoint utilities

### State Management

- **Zustand**: Lightweight state management for global app state
- **React Query (@tanstack/react-query)**: Server state management and caching
- **localStorage**: Persistent storage for authentication state

### Routing & Navigation

- **React Router v7**: Modern routing with protected routes
- **Role-based Access Control**: Different routes for candidates, employers, and admins
- **Route Protection**: Authentication-based route guards

### Development Tools

- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting and style consistency
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Basic UI elements (Button, Input, etc.)
│   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   └── forms/         # Form components
│   ├── pages/             # Route-based page components
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   └── profile/       # Profile management pages
│   ├── router/            # React Router configuration
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── jest.config.js         # Jest testing configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (for containerized development)

### Development Environment

#### Option 1: Docker Development (Recommended)
```bash
# Start the entire development stack
make dev

# Frontend will be available at http://localhost:3000
# Backend API at http://localhost:8000
```

#### Option 2: Local Development
```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint linting |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |

## 🎨 Design System

### Colors
The application uses a consistent color palette defined in Tailwind configuration:

```typescript
// tailwind.config.js
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    // ... full scale
  },
  secondary: {
    // ... color scale
  }
}
```

### Typography
- **Font Family**: Inter (loaded via Google Fonts)
- **Font Sizes**: Tailwind's default scale (text-sm, text-base, text-lg, etc.)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
Reusable components are built with consistent styling:

```typescript
// Button component example
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}
```

## 🔄 State Management

### Global State (Zustand)

#### Authentication Store
```typescript
// src/store/authStore.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  error: string | null
}
```

The auth store persists to localStorage and handles:
- User authentication state
- Login/logout actions
- Error handling
- Token management

### Server State (React Query)

React Query handles all server-side data:
- API caching and synchronization
- Background refetching
- Optimistic updates
- Error handling

```typescript
// Example API hook
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## 🛣️ Routing & Navigation

### Route Structure
```typescript
// src/router/index.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
])
```

### Protected Routes
Routes are protected based on authentication status and user roles:

```typescript
// Protected route component
const ProtectedRoute: React.FC<{ allowedRoles?: UserRole[] }> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
```

## 🧪 Testing Strategy

### Unit Testing with Jest & React Testing Library

```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing Configuration
- **Test Environment**: jsdom for DOM simulation
- **Test Utils**: Custom render function with providers
- **Mocking**: MSW for API mocking in tests
- **Coverage**: Jest coverage reports

## 🔧 Development Workflow

### Code Quality
- **Pre-commit Hooks**: Automatic linting and formatting
- **TypeScript**: Strict type checking
- **ESLint Rules**: React, TypeScript, and accessibility rules
- **Prettier**: Consistent code formatting

### Development Commands
```bash
# Using Make (recommended for full-stack development)
make test-frontend          # Run frontend tests
make lint-frontend          # Run frontend linting
make frontend-build         # Build frontend for production
make frontend-shell         # Open shell in frontend container

# Direct npm commands
npm run dev                 # Start development server
npm run test               # Run tests
npm run lint               # Run linting
npm run format             # Format code
```

## 🎯 Component Patterns

### Component Structure
```typescript
// Standard component structure
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState()

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Custom Hooks
```typescript
// Custom hook for API integration
export const useApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook logic

  return { data, loading, error }
}
```

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Mobile-First Approach
```jsx
// Example responsive component
<div className="
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
">
  {/* Grid items */}
</div>
```

## 🔐 Security Considerations

### Authentication
- JWT tokens stored securely
- Automatic token refresh
- Protected API routes
- CSRF protection

### Data Validation
- Input validation with TypeScript
- API response validation
- XSS prevention
- Secure data handling

## 🚀 Build & Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Production
The frontend uses multi-stage Docker builds:
- **Development**: Hot reload with volume mounting
- **Production**: Nginx-served static files

### Environment Variables
```bash
# .env file
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Safe Job Platform
```

## 📊 Performance Optimization

### Vite Optimizations
- **Hot Module Replacement**: Instant updates during development
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Lazy load routes and components
- **Asset Optimization**: Automatic image and CSS optimization

### React Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive computations
- **Lazy Loading**: Dynamic imports for routes
- **Bundle Analysis**: Monitor bundle size

## 🐛 Debugging

### Development Tools
- **React Developer Tools**: Component inspection
- **Redux DevTools**: State debugging (for Zustand)
- **Vite Dev Server**: Source maps and hot reload
- **TypeScript**: Compile-time error detection

### Error Handling
```typescript
// Error boundary for component errors
class ErrorBoundary extends React.Component {
  // Error boundary implementation
}

// API error handling with React Query
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  onError: (error) => {
    console.error('API Error:', error)
    // Handle error appropriately
  },
})
```

## 📝 Best Practices

### Code Organization
- One component per file
- Clear naming conventions
- Consistent file structure
- Proper TypeScript types

### Performance
- Minimize re-renders with proper dependencies
- Use React.memo for expensive components
- Implement proper loading states
- Optimize images and assets

### Accessibility
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatibility

### Testing
- Test user interactions, not implementation details
- Mock external dependencies
- Test error states and edge cases
- Maintain good test coverage

---

This frontend setup provides a solid foundation for building a modern, scalable, and maintainable React application with TypeScript, comprehensive tooling, and production-ready configurations.
