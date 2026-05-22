
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (data) => {
    const record = await pb.collection('users').create({
      ...data,
      emailVisibility: true,
    }, { $autoCancel: false });
    
    // Auto login after signup
    await login(data.email, data.password);
    return record;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const isAuthenticated = pb.authStore.isValid;
  const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'admin';
  const isAdmin  = currentUser?.role === 'admin';
  const isEditor = currentUser?.role === 'editor' || currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      signup,
      logout,
      isAuthenticated,
      isSeller,
      isAdmin,
      isEditor,
      initialLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
