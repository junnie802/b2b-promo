import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore.js';

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
});

describe('authStore', () => {
  it('setAuth는 user/accessToken/refreshToken을 정확히 반영한다', () => {
    const payload = {
      user: { id: 1, email: 'a@b.com' },
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    };

    useAuthStore.getState().setAuth(payload);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(payload.user);
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-123');
  });

  it('clearAuth는 세 필드를 모두 null로 리셋한다', () => {
    useAuthStore.getState().setAuth({
      user: { id: 1 },
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('localStorage가 없는 환경(node)에서도 에러 없이 동작한다', () => {
    expect(typeof globalThis.localStorage).toBe('undefined');

    expect(() =>
      useAuthStore.getState().setAuth({
        user: { id: 1 },
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
      })
    ).not.toThrow();

    expect(useAuthStore.getState().accessToken).toBe('access-123');
  });
});
