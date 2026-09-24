import { create } from 'zustand';

// Safely retrieve initial user from localStorage
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('shopsphere_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem('shopsphere_access_token') || null;
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  accessToken: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isLoading: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('shopsphere_user', JSON.stringify(user));
    if (accessToken) {
      localStorage.setItem('shopsphere_access_token', accessToken);
    }
    set({
      user,
      accessToken: accessToken || getStoredToken(),
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('shopsphere_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: () => {
    localStorage.removeItem('shopsphere_user');
    localStorage.removeItem('shopsphere_access_token');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
