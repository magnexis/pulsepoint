import { create } from "zustand";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  profileImage: string | null;
  isPrivate: boolean;
  isSharingData: boolean;
};

type AuthState = {
  user: CurrentUser | null;
  sessionId: string | null;
  isHydrated: boolean;
  setAuth: (user: CurrentUser, sessionId: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionId: null,
  isHydrated: false,
  setAuth: (user, sessionId) => {
    window.localStorage.setItem("pulsepoint-user-id", user.id);
    window.localStorage.setItem("pulsepoint-session-id", sessionId);
    window.localStorage.setItem("pulsepoint-user", JSON.stringify(user));
    set({ user, sessionId, isHydrated: true });
  },
  logout: () => {
    window.localStorage.removeItem("pulsepoint-user-id");
    window.localStorage.removeItem("pulsepoint-session-id");
    window.localStorage.removeItem("pulsepoint-user");
    set({ user: null, sessionId: null, isHydrated: true });
  },
  hydrate: () => {
    const rawUser = window.localStorage.getItem("pulsepoint-user");
    const sessionId = window.localStorage.getItem("pulsepoint-session-id");

    set({
      user: rawUser ? (JSON.parse(rawUser) as CurrentUser) : null,
      sessionId,
      isHydrated: true,
    });
  },
}));

