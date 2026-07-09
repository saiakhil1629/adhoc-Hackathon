import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMockMode, mockDB } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = localStorage.getItem('tt_session');
        const userObj = (session && session !== 'null') ? JSON.parse(session) : null;
        setUser(userObj);
      } catch (e) {
        console.error('Error loading session from localStorage', e);
      } finally {
        setLoading(false);
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
        // Query custom hr_admins table
        const { data, error } = await supabase
          .from('hr_admins')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          return { user: null, error: { message: 'Invalid email or password.' } };
        }

        if (!data.is_approved) {
          return { user: null, error: { message: 'Your account is pending database admin approval. Please set is_approved to TRUE in Supabase.' } };
        }

        // Successfully logged in via custom admins database
        const hrUser = { 
          id: data.id, 
          email: data.email, 
          role: 'HR Admin', 
          user_metadata: { name: data.name } 
        };

        localStorage.setItem('tt_session', JSON.stringify(hrUser));
        setUser(hrUser);
        return { user: hrUser, error: null };
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
        // Register account in hr_admins as pending (is_approved = false)
        const { data, error } = await supabase
          .from('hr_admins')
          .insert([{ 
            name, 
            email, 
            password, 
            is_approved: false // Admin must approve in Supabase
          }])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            throw new Error('An administrator account with this email already exists.');
          }
          throw error;
        }

        // Account registered successfully, return a clean message
        return { 
          user: null, 
          error: { 
            message: `Account created! Access is pending database admin approval. Please set 'is_approved' to true for '${email}' in your Supabase 'hr_admins' table.` 
          } 
        };
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
      localStorage.setItem('tt_session', 'null');
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
