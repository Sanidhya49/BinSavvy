
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { AuthContextType, User } from "@/types/auth";

// Mock data for demonstration purposes
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@binsavvy.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    email: "user@binsavvy.com",
    name: "Demo User",
    role: "user",
    createdAt: new Date().toISOString()
  }
];

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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email (mock authentication)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // In a real app, you'd verify the password here
      
      // Save user to state and localStorage
      setUser(foundUser);
      localStorage.setItem('binsavvy-user', JSON.stringify(foundUser));
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error("Email already in use");
      }
      
      // Create new user (in a real app, this would be saved to a database)
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: "user",
        createdAt: new Date().toISOString()
      };
      
      // Save user to state and localStorage
      setUser(newUser);
      localStorage.setItem('binsavvy-user', JSON.stringify(newUser));
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
