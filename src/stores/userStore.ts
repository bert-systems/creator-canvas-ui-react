/**
 * userStore.ts - User state management with Zustand
 * Handles user authentication state, preferences, and session management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== TYPE DEFINITIONS ====================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'user' | 'pro' | 'admin';
  createdAt: Date;
}

export interface UserPreferences {
  /** Default studio to open */
  defaultStudio: 'fashion' | 'social' | 'moodboards' | 'canvas';
  /** Default mode in studios */
  defaultMode: 'flow' | 'workspace' | 'timeline';
  /** Theme preference */
  theme: 'dark' | 'light' | 'system';
  /** Show onboarding tips */
  showTips: boolean;
  /** Auto-save interval in seconds (0 = disabled) */
  autoSaveInterval: number;
  /** Keyboard shortcuts enabled */
  keyboardShortcuts: boolean;
  /** Notification preferences */
  notifications: {
    generationComplete: boolean;
    exportComplete: boolean;
    collaboratorJoined: boolean;
  };
}

export interface UserSession {
  /** Session token */
  token: string;
  /** Token expiry timestamp */
  expiresAt: number;
  /** Refresh token */
  refreshToken?: string;
}

export interface UserState {
  // State
  user: User | null;
  session: UserSession | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastActivity: number;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: UserSession | null) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  login: (user: User, session: UserSession) => void;
  logout: () => void;
  updateLastActivity: () => void;
  setLoading: (loading: boolean) => void;
}

// ==================== DEFAULT VALUES ====================

const defaultPreferences: UserPreferences = {
  defaultStudio: 'fashion',
  defaultMode: 'flow',
  theme: 'dark',
  showTips: true,
  autoSaveInterval: 30,
  keyboardShortcuts: true,
  notifications: {
    generationComplete: true,
    exportComplete: true,
    collaboratorJoined: true,
  },
};

// ==================== STORE ====================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      preferences: defaultPreferences,
      isLoading: false,
      isAuthenticated: false,
      lastActivity: Date.now(),

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session && !!get().user,
        }),

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        })),

      resetPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),

      login: (user, session) =>
        set({
          user,
          session,
          isAuthenticated: true,
          lastActivity: Date.now(),
        }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),

      updateLastActivity: () =>
        set({
          lastActivity: Date.now(),
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),
    }),
    {
      name: 'creative-canvas-user',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        preferences: state.preferences,
      }),
    }
  )
);

// ==================== SELECTORS ====================

export const selectUser = (state: UserState) => state.user;
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectPreferences = (state: UserState) => state.preferences;
export const selectSession = (state: UserState) => state.session;

// ==================== HOOKS ====================

/**
 * Check if session is valid (not expired)
 */
export const useIsSessionValid = (): boolean => {
  const session = useUserStore((state) => state.session);
  if (!session) return false;
  return session.expiresAt > Date.now();
};

/**
 * Get user display name or fallback
 */
export const useDisplayName = (): string => {
  const user = useUserStore((state) => state.user);
  return user?.displayName || 'Guest';
};

/**
 * Get user initials for avatar fallback
 */
export const useUserInitials = (): string => {
  const user = useUserStore((state) => state.user);
  if (!user?.displayName) return 'G';

  const parts = user.displayName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return user.displayName.substring(0, 2).toUpperCase();
};

export default useUserStore;
