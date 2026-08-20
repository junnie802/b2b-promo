import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as applicationApi from '../api/applicationApi';
import { clearAppliedPrize } from '../utils/appliedPrizeStorage';

export function useApplyMutation(promotionId) {
  return useMutation({ mutationFn: () => applicationApi.applyToPromotion(promotionId) });
}

export function useMyApplicationsQuery() {
  return useQuery({ queryKey: ['myApplications'], queryFn: applicationApi.listMyApplications });
}

export function usePromotionApplicantsQuery(promotionId) {
  return useQuery({
    queryKey: ['promotionApplicants', promotionId],
    queryFn: () => applicationApi.listPromotionApplicants(promotionId),
    enabled: Boolean(promotionId),
  });
}

export function useCancelApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId }) => applicationApi.cancelApplication(applicationId),
    onSuccess: (_data, variables) => {
      if (variables.promotionId) {
        clearAppliedPrize(variables.promotionId);
      }
      queryClient.invalidateQueries({ queryKey: ['myApplications'] });
    },
  });
}
