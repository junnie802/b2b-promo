import { useMutation } from '@tanstack/react-query';
import * as authApi from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useSignupMutation() {
  return useMutation({ mutationFn: authApi.signup });
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
    },
  });
}

export function useLogoutMutation() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => {
      const { refreshToken } = useAuthStore.getState();
      return authApi.logout({ refresh_token: refreshToken });
    },
    onSettled: () => {
      clearAuth();
    },
  });
}
