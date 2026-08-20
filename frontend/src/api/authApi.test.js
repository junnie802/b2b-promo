import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client.js', () => {
  return { default: { post: vi.fn() } };
});

import client from './client.js';
import { signup, login, logout } from './authApi.js';

beforeEach(() => {
  client.post.mockReset();
});

describe('signup', () => {
  it('올바른 URL과 payload로 client.post를 호출한다', async () => {
    client.post.mockResolvedValueOnce({ data: { id: 1 } });

    await signup({
      email: 'a@b.com',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(client.post).toHaveBeenCalledWith('/api/auth/signup', {
      email: 'a@b.com',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });
  });

  it('성공 시 res.data를 반환한다', async () => {
    client.post.mockResolvedValueOnce({ data: { id: 1 } });

    const result = await signup({
      email: 'a@b.com',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(result).toEqual({ id: 1 });
  });
});

describe('login', () => {
  it('올바른 URL과 payload로 client.post를 호출한다', async () => {
    client.post.mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });

    await login({ email: 'a@b.com', password: 'password1' });

    expect(client.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'a@b.com',
      password: 'password1',
    });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { access_token: 'a', refresh_token: 'r' };
    client.post.mockResolvedValueOnce({ data });

    const result = await login({ email: 'a@b.com', password: 'password1' });

    expect(result).toEqual(data);
  });
});

describe('logout', () => {
  it('올바른 URL과 payload로 client.post를 호출한다', async () => {
    client.post.mockResolvedValueOnce({ data: {} });

    await logout({ refresh_token: 'r' });

    expect(client.post).toHaveBeenCalledWith('/api/auth/logout', { refresh_token: 'r' });
  });

  it('성공 시 res.data를 반환한다', async () => {
    client.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    const result = await logout({ refresh_token: 'r' });

    expect(result).toEqual({ message: 'ok' });
  });
});
