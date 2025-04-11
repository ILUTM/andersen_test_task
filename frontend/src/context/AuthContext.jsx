import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, storeAccessToken, clearAuthTokens } from '../api/fetch';
import API from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalType, setAuthModalType] = useState(null); // 'login' | 'register' | null

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // First try with existing access token
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return;
        }
  
        // If that fails, try refresh
        const refreshData = await tryRefreshToken();
        if (refreshData) {
          setUser(refreshData.user);
          setIsAuthenticated(true);
          return;
        }
  
        // If all fails, show login
        setAuthModalType('login');
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuth();
  }, []);

  const getUserData = async () => {
    try {
      const response = await apiFetch(API.USERS.ME);
      return response;
    } catch (error) {
      return null;
    }
  };

  const tryRefreshToken = async () => {
    try {
      const response = await fetch(API.AUTH.TOKEN.REFRESH, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Handle both old and new response formats
      const userData = data.user || {
        id: data.id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
      };
      
      storeAccessToken(data.access);
      return {
        access: data.access,
        user: userData
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      const data = await apiFetch(API.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      storeAccessToken(data.access);
      const userData = await getUserData();
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthModalType(null); // Close modal on successful login
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      await apiFetch(API.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Automatically login after registration
      return await login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(API.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      // Clear client-side tokens and state
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      setAuthModalType('login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear client-side state even if server logout failed
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      setAuthModalType('login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authModalType,
        setAuthModalType,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);