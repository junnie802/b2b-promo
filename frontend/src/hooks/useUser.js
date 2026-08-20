import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/userApi';
import { useAuthStore } from '../store/authStore';

export function useMeQuery() {
  return useQuery({ queryKey: ['me'], queryFn: userApi.getMe });
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => userApi.updateMe(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      const { accessToken, refreshToken } = useAuthStore.getState();
      useAuthStore.getState().setAuth({ user: data, accessToken, refreshToken });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: (payload) => userApi.changePassword(payload) });
}
