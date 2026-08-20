import client from './client';

export function getMe() {
  return client.get('/api/users/me').then((res) => res.data);
}

export function updateMe(payload) {
  return client.patch('/api/users/me', payload).then((res) => res.data);
}

export function changePassword(payload) {
  return client.patch('/api/users/me/password', payload).then((res) => res.data);
}
