import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import api from '@/lib/api';

type UserRole = 'student' | 'placement_officer' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  registerNumber?: string;
  phone?: string;
  department?: string;
  section?: string;
  gpa?: number;
  resumeUrl?: string;
  photoUrl?: string;
  isPlaced?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserData: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Normalize API responses (axios interceptor already returns `response.data`)
const extractPayload = (resp: any) => {
  if (!resp) return null;
  // Typical shape: { success: true, data: { ...user } }
  if (resp && typeof resp === 'object') {
    // If it has a 'data' property with user info, return it
    if (resp.data && typeof resp.data === 'object' && resp.data.id) {
      return resp.data;
    }
    // If it's already the user object (has id property), return as-is
    if (resp.id) return resp;
  }
  // Fallback
  return resp;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializeRef = useRef(false);

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
    
    if (!hasToken) {
      setIsLoading(false);
      // Reset initialization if no token (user logged out)
      initializeRef.current = false;
      return;
    }

    if (initializeRef.current) return;
    initializeRef.current = true;

    const initAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        const payload = extractPayload(response);
        if (payload && payload.id) {
          setUser(payload as AuthUser);
        } else {
          console.warn('Invalid user payload received:', payload);
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Set user to null on auth fail - React Router will redirect via isAuthenticated
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      // no-op cleanup
    };
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const payload = extractPayload(response);
      if (payload && payload.id) {
        setUser(payload as AuthUser);
      } else {
        console.warn('Invalid user payload received:', payload);
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const setUserData = (updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const payload = extractPayload(response) as any;
      const { token, ...userData } = payload || {};
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { error: null };
    } catch (error: any) {
      const message = error?.message || error?.data?.message || 'Login failed';
      return { error: new Error(message) };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const payload = extractPayload(response) as any;
      const { token, ...userData } = payload || {};
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { error: null };
    } catch (error: any) {
      const message = error?.message || error?.data?.message || 'Registration failed';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsLoading(false);
    localStorage.removeItem('token');
    if (api.defaults.headers.common) {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
