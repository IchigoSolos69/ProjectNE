import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  fetchWishlistIds: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const fetchWishlistIds = async () => {
    try {
      const data: any = await apiRequest('/api/wishlist');
      if (Array.isArray(data)) {
        setWishlistIds(data.map((item: any) => item.id));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist IDs:', err);
    }
  };

  // Initialize and check current user status
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data: any = await apiRequest('/api/auth/me');
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('rc_session_token');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // Fetch wishlist IDs when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlistIds();
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('rc_session_token', data.token);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('rc_session_token', data.token);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('rc_session_token', data.token);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('rc_session_token');
      setWishlistIds([]);
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Please sign in to save items to your wishlist.');
    }
    const isSaved = wishlistIds.includes(productId);
    try {
      if (isSaved) {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        await apiRequest(`/api/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        setWishlistIds((prev) => [...prev, productId]);
        await apiRequest('/api/wishlist', {
          method: 'POST',
          body: JSON.stringify({ productId }),
        });
      }
    } catch (err) {
      // Revert state on failure
      if (isSaved) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      console.error('Failed to toggle wishlist item:', err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAdmin,
        wishlistIds,
        toggleWishlist,
        fetchWishlistIds,
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
