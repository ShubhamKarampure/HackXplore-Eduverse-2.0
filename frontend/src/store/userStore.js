import { create } from 'zustand';
import Cookies from 'js-cookie';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: Cookies.get('auth-token') || null,
      onboardingRequired: Cookies.get('onboarding-required') === 'true',
     
      // Login action
      login: (userData, token, onboardingRequired) => {
        Cookies.set('auth-token', token, { expires: 7 });
        Cookies.set('onboarding-required', onboardingRequired.toString(), { expires: 7 });

        set({
          user: userData,
          token: token,
          onboardingRequired: onboardingRequired,
          error: null,
        });
      },

      // Logout action
      logout: () => {
        Cookies.remove('auth-token');
        Cookies.remove('onboarding-required');

        set({
          user: null,
          token: null,
          onboardingRequired: false,
          error: null,
        });
      },

      // Update user profile
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),

      // Complete onboarding
      completeOnboarding: () => {
        Cookies.set('onboarding-required', 'false', { expires: 7 });

        set({
          onboardingRequired: false,
        });
      },
    }),
    {
      name: 'user-store', 
      getStorage: () => localStorage, 
    }
  )
);

export default useUserStore;