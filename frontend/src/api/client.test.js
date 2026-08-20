import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const fakeClient = vi.fn();
  fakeClient.interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };
  const create = vi.fn(() => fakeClient);
  const post = vi.fn();
  return { default: { create, post } };
});

import axios from 'axios';
import client from './client.js';
import { useAuthStore } from '../store/authStore.js';

// client.js 모듈 로드 시 axios.create()가 호출되며 client === fakeClient (axios.create 반환값)
const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1];

function make401Error(originalRequest) {
  return {
    response: { status: 401 },
    config: originalRequest,
  };
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  axios.post.mockReset();
  client.mockReset();
});

describe('client 요청 인터셉터', () => {
  it('accessToken이 있으면 Authorization 헤더를 첨부한다', () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'access-1', refreshToken: 'refresh-1' });

    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer access-1');
  });

  it('accessToken이 없으면 Authorization 헤더를 첨부하지 않는다', () => {
    const config = { headers: {} };
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe('client 응답 인터셉터 (401 처리)', () => {
  it('401 + refresh 성공 시 토큰을 갱신하고 원요청을 새 토큰으로 재시도한다', async () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'old-access', refreshToken: 'valid-refresh' });
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'new-access', refresh_token: 'new-refresh' },
    });
    client.mockResolvedValueOnce({ data: 'ok' });

    const originalRequest = { url: '/api/orders', headers: { Authorization: 'Bearer old-access' } };
    const error = make401Error(originalRequest);

    const result = await responseErrorInterceptor(error);

    expect(result).toEqual({ data: 'ok' });
    expect(useAuthStore.getState().accessToken).toBe('new-access');
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
    expect(originalRequest._retry).toBe(true);
    expect(client).toHaveBeenCalledTimes(1);
    expect(client).toHaveBeenCalledWith(originalRequest);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('refresh 엔드포인트 자체가 401이면 refresh를 호출하지 않고 즉시 reject하며 인증정보를 클리어한다', async () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'old-access', refreshToken: 'valid-refresh' });

    const originalRequest = { url: '/api/auth/refresh', headers: {} };
    const error = make401Error(originalRequest);

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(axios.post).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('이미 _retry가 true인 요청은 재시도 없이 즉시 reject한다', async () => {
    const originalRequest = { url: '/api/orders', headers: {}, _retry: true };
    const error = make401Error(originalRequest);

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(axios.post).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it('401이 아닌 에러는 그대로 reject한다', async () => {
    const originalRequest = { url: '/api/orders', headers: {} };
    const error = { response: { status: 500 }, config: originalRequest };

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(axios.post).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
  });

  it('동시에 여러 401을 받아도 refresh 호출은 1번만 발생한다(in-flight 공유)', async () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'old-access', refreshToken: 'valid-refresh' });
    axios.post.mockResolvedValueOnce({
      data: { access_token: 'new-access', refresh_token: 'new-refresh' },
    });
    client.mockResolvedValue({ data: 'ok' });

    const originalRequest1 = { url: '/api/orders', headers: {} };
    const originalRequest2 = { url: '/api/products', headers: {} };

    const [result1, result2] = await Promise.all([
      responseErrorInterceptor(make401Error(originalRequest1)),
      responseErrorInterceptor(make401Error(originalRequest2)),
    ]);

    expect(result1).toEqual({ data: 'ok' });
    expect(result2).toEqual({ data: 'ok' });
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(client).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().accessToken).toBe('new-access');
  });

  it('refreshToken이 없으면 refresh를 호출하지 않고 즉시 reject하며 인증정보를 클리어한다', async () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'old-access', refreshToken: null });

    const originalRequest = { url: '/api/auth/login', headers: {} };
    const error = make401Error(originalRequest);

    await expect(responseErrorInterceptor(error)).rejects.toBe(error);

    expect(axios.post).not.toHaveBeenCalled();
    expect(client).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('refresh 실패 시 인증정보를 클리어하고 reject한다', async () => {
    useAuthStore.getState().setAuth({ user: null, accessToken: 'old-access', refreshToken: 'invalid-refresh' });
    const refreshError = new Error('refresh failed');
    axios.post.mockRejectedValueOnce(refreshError);

    const originalRequest = { url: '/api/orders', headers: {} };
    const error = make401Error(originalRequest);

    await expect(responseErrorInterceptor(error)).rejects.toBeTruthy();

    expect(client).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });
});
