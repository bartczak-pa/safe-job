import { render, screen } from '../../../test/utils';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../store/authStore';

// Mock the auth store
jest.mock('../../../store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'candidate',
        isVerified: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      clearError: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });
});
