import client from './client';

export function applyToPromotion(id) {
  return client.post(`/api/promotions/${id}/applications`).then((res) => res.data);
}

export function listMyApplications() {
  return client.get('/api/applications/me').then((res) => res.data);
}

export function cancelApplication(applicationId) {
  return client.patch(`/api/applications/${applicationId}/cancel`).then((res) => res.data);
}

export function listPromotionApplicants(promotionId) {
  return client.get(`/api/promotions/${promotionId}/applications`).then((res) => res.data);
}
