import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as promotionApi from '../api/promotionApi';

export function usePromotionListQuery(status) {
  return useQuery({
    queryKey: ['promotions', status],
    queryFn: () => promotionApi.listPromotions({ status }),
  });
}

export function usePromotionDetailQuery(id) {
  return useQuery({
    queryKey: ['promotion', id],
    queryFn: () => promotionApi.getPromotionDetail(id),
    enabled: Boolean(id),
  });
}

export function useChangePromotionStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => promotionApi.changePromotionStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function useCreatePromotionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => promotionApi.createPromotion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
}

export function useUpdatePromotionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => promotionApi.updatePromotion(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
}
