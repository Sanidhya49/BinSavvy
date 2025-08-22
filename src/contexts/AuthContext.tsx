
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { authManager, JWTPayload } from '@/lib/auth';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshData: () => void;
  lastDataRefresh: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default context instead of throwing an error
    console.warn('useAuth called outside of AuthProvider, returning default values');
    return {
      user: null,
      loading: false,
      login: async () => false,
      register: async () => false,
      logout: () => {},
      isAuthenticated: false,
      isAdmin: false,
      refreshData: () => {},
      lastDataRefresh: null,
    };
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastDataRefresh, setLastDataRefresh] = useState<Date | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const hasTokens = authManager.isAuthenticated();
        console.log('Auth check - has tokens:', hasTokens);
        
        if (hasTokens) {
          // For mobile compatibility, set authentication state immediately if tokens exist
          setIsAuthenticated(true);
          console.log('Tokens found, setting authentication state for mobile compatibility');
          
          // Try to get user data if possible, but don't fail if it doesn't work
          try {
            // This is a demo app, so we'll use a simple approach
            // In a real app, you'd validate the token with the backend
            const storedUser = localStorage.getItem('demo_user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              console.log('Restored user from storage:', userData);
            }
          } catch (e) {
            console.log('Could not restore user data, but keeping authentication state');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authManager.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const refreshData = () => {
    console.log('Global data refresh triggered');
    setLastDataRefresh(new Date());
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting login for:', username);
      
      const response = await apiClient.login(username, password);
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.data) {
        console.log('AuthContext: Setting user:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true); // Set authentication state immediately
        
        // Store user data for mobile compatibility
        try {
          localStorage.setItem('demo_user', JSON.stringify(response.data.user));
        } catch (e) {
          console.log('Could not store user data in localStorage');
        }
        
        // Force a re-render by updating state
        console.log('AuthContext: Login successful, user set:', response.data.user);
        
        return true;
      } else {
        console.error('AuthContext: Login failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting registration for:', userData.username);
      
      const response = await apiClient.register(userData);
      console.log('AuthContext: Registration response:', response);
      
      if (response.success && response.data) {
        // After successful registration, log the user in
        return await login(userData.username, userData.password);
      } else {
        console.error('AuthContext: Registration failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false); // Clear authentication state
      authManager.logout();
    }
  };

  // Use local state for isAuthenticated instead of authManager
  const isAdmin = user?.role === 'admin' || false;

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    refreshData,
    lastDataRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
