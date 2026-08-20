import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client.js', () => {
  return { default: { get: vi.fn(), patch: vi.fn() } };
});

import client from './client.js';
import { getMe, updateMe, changePassword } from './userApi.js';

beforeEach(() => {
  client.get.mockReset();
  client.patch.mockReset();
});

describe('getMe', () => {
  it('올바른 URL로 client.get을 호출한다', async () => {
    client.get.mockResolvedValueOnce({ data: { id: 1, name: '홍길동' } });

    await getMe();

    expect(client.get).toHaveBeenCalledWith('/api/users/me');
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 1, name: '홍길동' };
    client.get.mockResolvedValueOnce({ data });

    const result = await getMe();

    expect(result).toEqual(data);
  });
});

describe('updateMe', () => {
  it('올바른 URL과 payload로 client.patch를 호출한다', async () => {
    client.patch.mockResolvedValueOnce({ data: { id: 1, name: 'A' } });

    await updateMe({ name: 'A' });

    expect(client.patch).toHaveBeenCalledWith('/api/users/me', { name: 'A' });
  });

  it('성공 시 res.data를 반환한다', async () => {
    const data = { id: 1, name: 'A' };
    client.patch.mockResolvedValueOnce({ data });

    const result = await updateMe({ name: 'A' });

    expect(result).toEqual(data);
  });
});

describe('changePassword', () => {
  it('올바른 URL과 payload로 client.patch를 호출한다', async () => {
    client.patch.mockResolvedValueOnce({ data: {} });

    await changePassword({ current_password: 'a', new_password: 'b' });

    expect(client.patch).toHaveBeenCalledWith('/api/users/me/password', {
      current_password: 'a',
      new_password: 'b',
    });
  });

  it('성공 시 res.data를 반환한다', async () => {
    client.patch.mockResolvedValueOnce({ data: { message: 'ok' } });

    const result = await changePassword({ current_password: 'a', new_password: 'b' });

    expect(result).toEqual({ message: 'ok' });
  });
});
