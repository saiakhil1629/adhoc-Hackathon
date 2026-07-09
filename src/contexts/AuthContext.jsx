import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMockMode, mockDB } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isMockMode) {
        const { data } = await mockDB.auth.getUser();
        setUser(data.user);
        setLoading(false);
      } else {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isMockMode) {
        const { data, error } = await mockDB.auth.signIn(email, password);
        if (error) throw error;
        setUser(data.user);
        return { user: data.user, error: null };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        return { user: data.user, error: null };
      }
    } catch (error) {
      setLoading(false);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password) => {
    setLoading(true);
    try {
      if (isMockMode) {
        const { data, error } = await mockDB.auth.signUp(email, password, { data: { name } });
        if (error) throw error;
        setUser(data.user);
        return { user: data.user, error: null };
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });
        if (error) throw error;
        setUser(data.user);
        return { user: data.user, error: null };
      }
    } catch (error) {
      setLoading(false);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        await mockDB.auth.signOut();
      } else {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    registerUser,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
