import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import {
  clearSession,
  createUserEntity,
  getSessionUserId,
  getUsers,
  initializeStorage,
  saveUsers,
  setSessionUserId
} from '../utils/storage';

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextValue {
  isReady: boolean;
  user: User | null;
  users: User[];
  isAdmin: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (payload: RegisterPayload) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'phone' | 'email' | 'role'>>) => { ok: boolean; error?: string };
  resetUserPassword: (userId: string, nextPassword: string) => { ok: boolean; error?: string };
  changeOwnPassword: (currentPassword: string, nextPassword: string) => { ok: boolean; error?: string };
  createSuperUser: (payload: RegisterPayload) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeStorage();
    const storedUsers = getUsers();
    setUsers(storedUsers);

    const sessionUserId = getSessionUserId();
    if (sessionUserId) {
      const sessionUser = storedUsers.find((item) => item.id === sessionUserId) || null;
      setUser(sessionUser);
    }
    setIsReady(true);
  }, []);

  const isAdmin = user?.role === 'admin';

  const persistUsers = (nextUsers: User[]) => {
    setUsers(nextUsers);
    saveUsers(nextUsers);
    if (user) {
      const refreshedUser = nextUsers.find((item) => item.id === user.id) || null;
      setUser(refreshedUser);
      if (!refreshedUser) {
        clearSession();
      }
    }
  };

  const login: AuthContextValue['login'] = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((item) => item.email === normalizedEmail);
    if (!existingUser || existingUser.password !== password) {
      return { ok: false, error: 'Неверный email или пароль' };
    }

    setUser(existingUser);
    setSessionUserId(existingUser.id);
    return { ok: true };
  };

  const register: AuthContextValue['register'] = (payload) => {
    if (!payload.password || payload.password.length < 6) {
      return { ok: false, error: 'Пароль должен быть не менее 6 символов' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (users.some((item) => item.email === normalizedEmail)) {
      return { ok: false, error: 'Пользователь с таким email уже существует' };
    }

    const nextUser = createUserEntity({
      name: payload.name.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      password: payload.password,
      role: 'user'
    });

    const nextUsers = [...users, nextUser];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    setUser(nextUser);
    setSessionUserId(nextUser.id);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  const updateUser: AuthContextValue['updateUser'] = (userId, updates) => {
    const normalizedEmail = updates.email?.trim().toLowerCase();
    if (normalizedEmail && users.some((item) => item.email === normalizedEmail && item.id !== userId)) {
      return { ok: false, error: 'Email уже используется' };
    }

    const nextUsers = users.map((item) => {
      if (item.id !== userId) {
        return item;
      }
      return {
        ...item,
        ...updates,
        ...(normalizedEmail ? { email: normalizedEmail } : {})
      };
    });

    persistUsers(nextUsers);
    return { ok: true };
  };

  const resetUserPassword: AuthContextValue['resetUserPassword'] = (userId, nextPassword) => {
    if (!nextPassword || nextPassword.length < 6) {
      return { ok: false, error: 'Пароль должен быть не менее 6 символов' };
    }

    const nextUsers = users.map((item) => (item.id === userId ? { ...item, password: nextPassword } : item));
    persistUsers(nextUsers);
    return { ok: true };
  };

  const changeOwnPassword: AuthContextValue['changeOwnPassword'] = (currentPassword, nextPassword) => {
    if (!user) {
      return { ok: false, error: 'Сначала выполните вход' };
    }
    if (user.password !== currentPassword) {
      return { ok: false, error: 'Текущий пароль указан неверно' };
    }
    return resetUserPassword(user.id, nextPassword);
  };

  const createSuperUser: AuthContextValue['createSuperUser'] = (payload) => {
    if (!payload.password || payload.password.length < 6) {
      return { ok: false, error: 'Пароль должен быть не менее 6 символов' };
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    if (users.some((item) => item.email === normalizedEmail)) {
      return { ok: false, error: 'Пользователь с таким email уже существует' };
    }

    const superUser = createUserEntity({
      name: payload.name.trim(),
      email: normalizedEmail,
      phone: payload.phone.trim(),
      password: payload.password,
      role: 'admin'
    });
    const nextUsers = [...users, superUser];
    persistUsers(nextUsers);
    return { ok: true };
  };

  const value: AuthContextValue = {
    user,
    isReady,
    users,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    resetUserPassword,
    changeOwnPassword,
    createSuperUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
