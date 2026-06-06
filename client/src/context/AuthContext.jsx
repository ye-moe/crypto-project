import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getStoredToken,
  loginUser,
  registerUser,
  removeStoredToken,
  setStoredToken,
} from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();

      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error(error);
        removeStoredToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadUser();
  }, []);

  async function register(formData) {
    const data = await registerUser(formData);
    setStoredToken(data.token);
    setUser(data.user);
  }

  async function login(formData) {
    const data = await loginUser(formData);
    setStoredToken(data.token);
    setUser(data.user);
  }

  function logout() {
    removeStoredToken();
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}