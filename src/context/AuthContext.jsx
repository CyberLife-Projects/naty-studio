import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar sessão atual ao carregar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Buscar sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Buscar perfil do usuário
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError(err.message);
    }
  };

  // Login com email e senha
  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Registrar novo usuário
  const signUp = async (email, password, metadata = {}) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || '',
            role: 'client', // Sempre começa como client
          }
        }
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (err) {
      console.error('Erro no logout:', err);
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Resetar senha
  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      return { error: null };
    } catch (err) {
      console.error('Erro ao resetar senha:', err);
      setError(err.message);
      return { error: err.message };
    }
  };

  // Atualizar senha
  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      return { error: null };
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      setError(err.message);
      return { error: err.message };
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      // Atualizar estado local
      await fetchProfile(user.id);
      
      return { error: null };
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message);
      return { error: err.message };
    }
  };

  // Verificar se o usuário é admin
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // Verificar se está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
