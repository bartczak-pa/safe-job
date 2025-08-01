export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "candidate" | "employer" | "admin";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  role: "candidate" | "employer";
}
