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
      try {
        // First try to get user data with existing token
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return;
        }

        // If no user data, try to refresh token
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const refreshedUserData = await getUserData();
          if (refreshedUserData) {
            setUser(refreshedUserData);
            setIsAuthenticated(true);
            return;
          }
        }

        // If all fails, show auth modal
        setAuthModalType('login');
      } catch (error) {
        console.error('Auth check failed:', error);
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

      if (!response.ok) return false;

      const data = await response.json();
      storeAccessToken(data.access);
      return true;
    } catch (error) {
      return false;
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
      await apiFetch(API.AUTH.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      setAuthModalType('login'); // Show login modal after logout
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