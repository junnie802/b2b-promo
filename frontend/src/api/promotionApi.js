import client from './client';

export function listPromotions({ status } = {}) {
  return client.get('/api/promotions', { params: status ? { status } : {} }).then((res) => res.data);
}

export function getPromotionDetail(id) {
  return client.get(`/api/promotions/${id}`).then((res) => res.data);
}

export function changePromotionStatus(id, action) {
  return client.patch(`/api/promotions/${id}/status`, { action }).then((res) => res.data);
}

export function createPromotion(payload) {
  return client.post('/api/promotions', payload).then((res) => res.data);
}

export function updatePromotion(id, payload) {
  return client.patch(`/api/promotions/${id}`, payload).then((res) => res.data);
}
