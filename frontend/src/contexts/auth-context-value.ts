import { createContext } from 'react';
import type { User } from '../api/types';

export type AuthState = {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
};

export type AuthContextValue = AuthState & {
  readonly login: (email: string, password: string) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
