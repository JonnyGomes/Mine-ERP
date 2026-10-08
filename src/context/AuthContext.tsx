import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService, AuthCredentials, AuthUser, SessionData } from '../services/authService';
import { StorageService } from '../services/storage';
import { User, PermissionKey } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  currentUser: User;
  users: User[];
  isLoading: boolean;
  error: string | null;
  rememberedUser: string;
  login: (credentials: AuthCredentials, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  hasPermission: (permission: PermissionKey) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(() => AuthService.getSession());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberedUser, setRememberedUser] = useState<string>(() => AuthService.getRememberedUser());
  const [usersList] = useState<User[]>(() => StorageService.getUsers());

  // Converte usuário da sessão para o modelo User ou usa o primeiro da lista
  const currentUser: User = React.useMemo(() => {
    if (session?.user) {
      const match = usersList.find((u) => u.login.toLowerCase() === session.user.username.toLowerCase());
      if (match) return match;
      return {
        id: session.user.id,
        name: session.user.name,
        login: session.user.username,
        email: session.user.email,
        role: 'ADMINISTRADOR',
        status: 'ATIVO',
        permissions: [
          'view_product',
          'edit_product',
          'delete_product',
          'change_price',
          'give_discount',
          'cancel_sale',
          'open_cashier',
          'close_cashier',
          'view_finance',
          'delete_order',
          'manage_users',
          'manage_stock',
        ],
      };
    }
    return usersList[0];
  }, [session, usersList]);

  useEffect(() => {
    // Valida sessão inicial
    const active = AuthService.getSession();
    setSession(active);
    setRememberedUser(AuthService.getRememberedUser());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (credentials: AuthCredentials, rememberMe = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials, rememberMe);

      if (response.success && response.data) {
        setSession(response.data);
        if (rememberMe) {
          setRememberedUser(credentials.username.trim().toLowerCase());
        } else {
          setRememberedUser('');
        }
        setIsLoading(false);
        return true;
      } else {
        setError(response.message || 'Usuário ou senha inválidos.');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Ocorreu um erro ao conectar ao serviço de autenticação.');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await AuthService.logout();
    setSession(null);
    setIsLoading(false);
  }, []);

  const switchUser = useCallback((userId: string) => {
    const found = usersList.find((u) => u.id === userId);
    if (found) {
      setSession({
        token: 'jwt_mock_' + found.id,
        user: {
          id: found.id,
          name: found.name,
          username: found.login,
          email: found.email,
          role: found.role,
        },
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      });
    }
  }, [usersList]);

  const hasPermission = useCallback((permission: PermissionKey): boolean => {
    if (currentUser.role === 'ADMINISTRADOR') return true;
    return currentUser.permissions.includes(permission);
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session && session.user),
        user: session?.user || null,
        currentUser,
        users: usersList,
        isLoading,
        error,
        rememberedUser,
        login,
        logout,
        switchUser,
        hasPermission,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
