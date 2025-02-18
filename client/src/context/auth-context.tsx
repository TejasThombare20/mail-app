import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { User } from '../types/auth-types';


interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
  
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface PrivateRouteProps {
    children: React.ReactNode;
  }

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    // const { user } = useAuth();

    const token = Cookies.get("auth_token");

    return token ? <>{children}</> : <Navigate to="/login"/>;
  };
  
  export default PrivateRoute;