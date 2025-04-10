import API from './endpoints';

// Helper function for API calls
export const apiFetch = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // For cookies
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && !url.includes('/token/refresh/')) {
      const refreshSuccess = await tryRefreshToken();
      if (refreshSuccess) {
        // Retry original request with new token
        return apiFetch(url, options);
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Try to refresh access token
export const tryRefreshToken = async () => {
  try {
    const response = await fetch(API.AUTH.TOKEN.REFRESH, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Refresh token failed:', error);
    return null;
  }
};

// Token management functions
export const storeAccessToken = (access) => {
  localStorage.setItem('access_token', access);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  // Backend should handle cookie invalidation
};

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};