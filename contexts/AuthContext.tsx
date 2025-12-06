'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, Role } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define loadUser first (before it's used in checkUser and useEffect)
  const loadUser = useCallback(async (supabaseUser: any) => {
    try {
      // Get user metadata (name and role stored in user_metadata)
      const metadata = supabaseUser.user_metadata || {};
      const name = metadata.name || supabaseUser.email?.split('@')[0] || 'User';
      const role = (metadata.role as Role) || 'BUYER';

      const user: User = {
        id: supabaseUser.id,
        name,
        email: supabaseUser.email || '',
        role,
      };
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser(null);
    }
  }, []);

  // Define checkUser before useEffect uses it
  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUser(session.user);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUser, loadUser]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting sign up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'BUYER', // Default role for all users, but they have access to both dashboards
          },
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful, user data:', data);
      if (data.user) {
        await loadUser(data.user);
      }
    } catch (error: any) {
      console.error('Sign up catch error:', error);
      setIsLoading(false);
      // Handle network errors specifically
      if (error.message?.includes('fetch') || error.message?.includes('network') || !error.message) {
        throw new Error('Network error: Unable to connect to authentication service. Please check your internet connection and try again.');
      }
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await loadUser(data.user);
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Get current metadata
      const currentMetadata = user.user_metadata || {};
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          name,
        },
      });

      if (updateError) throw updateError;

      // Also update the profiles table (in case trigger doesn't fire)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      // Don't throw on profile error - it's not critical if profiles table doesn't exist yet
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Failed to update profile table:', profileError.message);
      }

      // Reload user to get updated data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        await loadUser(updatedUser);
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ currentUser, signUp, signIn, logout, updateProfile, isLoading }}>
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
