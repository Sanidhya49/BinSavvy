
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthContextType, User } from "@/types/auth";
import { apiClient } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('binsavvy-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('binsavvy-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use a simple check since we don't have full Firebase auth yet
      // In a real app, this would call Firebase Auth or your backend auth endpoint
      
      // Check if backend is running
      try {
        await apiClient.checkUserServiceHealth();
      } catch (backendError) {
        throw new Error("Backend service is not available. Please start the Django server.");
      }
      
      // For demo purposes, allow these test accounts
      const validEmails = [
        'admin@binsavvy.com',
        'user@binsavvy.com',
        'test@binsavvy.com'
      ];
      
      if (!validEmails.includes(email)) {
        throw new Error("Invalid email or password. Try: admin@binsavvy.com or user@binsavvy.com");
      }
      
      // Create user object
      const userData: User = {
        id: email === 'admin@binsavvy.com' ? 'admin-1' : 'user-1',
        email,
        name: email === 'admin@binsavvy.com' ? 'Admin User' : 'Demo User',
        role: email === 'admin@binsavvy.com' ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      
      // Save user to state and localStorage
      setUser(userData);
      localStorage.setItem('binsavvy-user', JSON.stringify(userData));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if backend is running
      try {
        await apiClient.checkUserServiceHealth();
      } catch (backendError) {
        throw new Error("Backend service is not available. Please start the Django server.");
      }
      
      // For demo purposes, create a new user
      const userData: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: "user",
        createdAt: new Date().toISOString()
      };
      
      // Save user to state and localStorage
      setUser(userData);
      localStorage.setItem('binsavvy-user', JSON.stringify(userData));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('binsavvy-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
