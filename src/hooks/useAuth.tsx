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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        initializeRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const payload = response?.data?.data || response?.data || response;
      const { token, ...userData } = payload;
      
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
      const payload = response?.data?.data || response?.data || response;
      const { token, ...userData } = payload;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { error: null };
    } catch (error: any) {
      const message = error?.message || error?.data?.message || 'Registration failed';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    // Reset initialization ref so auth can check again on next load
    initializeRef.current = false;
    // Clear state
    setUser(null);
    setIsLoading(false);
    // Remove token
    localStorage.removeItem('token');
    // Clear API auth header
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
