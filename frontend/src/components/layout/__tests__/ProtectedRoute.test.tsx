import { useAuthStore } from "../../../store/authStore";
import { render, screen } from "../../../test/utils";
import { ProtectedRoute } from "../ProtectedRoute";

// Mock the auth store
jest.mock("../../../store/authStore");
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

// Mock react-router-dom Navigate component
jest.mock("react-router-dom", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual("react-router-dom");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      // Return a div with the navigation target for testing
      return <div data-testid="navigate" data-to={to} />;
    },
    useLocation: () => ({
      pathname: "/test",
      search: "",
      hash: "",
      state: null,
    }),
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render children when user is authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "candidate",
        isVerified: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
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
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("should not render children when user is not authenticated", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
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
      </ProtectedRoute>,
    );

    // Verify that the protected content is not rendered
    expect(screen.queryByText("Protected Content")).toBeNull();
    // Verify that navigation to login was attempted
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe(
      "/login",
    );
  });

  it("should redirect to unauthorized when user role does not match required role", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "candidate",
        isVerified: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
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
      <ProtectedRoute requiredRole="employer">
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    // Verify that the protected content is not rendered
    expect(screen.queryByText("Protected Content")).toBeNull();
    // Verify that navigation to unauthorized was attempted
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe(
      "/unauthorized",
    );
  });
});
