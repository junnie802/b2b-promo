import client from './client';

export function signup({ email, password, name, company_name }) {
  return client
    .post('/api/auth/signup', { email, password, name, company_name })
    .then((res) => res.data);
}

export function login({ email, password }) {
  return client.post('/api/auth/login', { email, password }).then((res) => res.data);
}

export function logout({ refresh_token }) {
  return client.post('/api/auth/logout', { refresh_token }).then((res) => res.data);
}
