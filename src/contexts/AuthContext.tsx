
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { ApiUrl } from '@/Constants';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userRole: string | null;
  login: (token: string, email?: string, role?: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('user_email'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('user_role'));
  const navigate = useNavigate();

  const login = (token: string, email?: string, role?: string) => {
    localStorage.setItem('access_token', token);
    
    if (email) {
      localStorage.setItem('user_email', email);
      setUserEmail(email);
    }
    
    if (role) {
      localStorage.setItem('user_role', role);
      setUserRole(role);
    }
    
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserRole(null);
    navigate('/login');
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const response = await axios.get(`${ApiUrl}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.valid) {
        setIsAuthenticated(true);
        
        // Store email and role in localStorage if received
        if (response.data.email) {
          localStorage.setItem('user_email', response.data.email);
          setUserEmail(response.data.email);
        }
        
        if (response.data.role) {
          localStorage.setItem('user_role', response.data.role);
          setUserRole(response.data.role);
        }
        
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userRole, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
