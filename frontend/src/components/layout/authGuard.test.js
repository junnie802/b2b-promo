import { describe, it, expect } from 'vitest';
import { resolveRedirect } from './authGuard.js';

describe('resolveRedirect', () => {
  it('accessToken이 없으면 /login을 반환한다', () => {
    const result = resolveRedirect({ accessToken: null, user: { role: 'buyer' } });

    expect(result).toBe('/login');
  });

  it('user가 없으면 /login을 반환한다', () => {
    const result = resolveRedirect({ accessToken: 'token', user: null });

    expect(result).toBe('/login');
  });

  it('accessToken과 user가 모두 없으면 /login을 반환한다', () => {
    const result = resolveRedirect({ accessToken: null, user: null });

    expect(result).toBe('/login');
  });

  it('roles 제한이 없고 accessToken과 user가 있으면 null을 반환한다', () => {
    const result = resolveRedirect({ accessToken: 'token', user: { role: 'buyer' } });

    expect(result).toBeNull();
  });

  it("roles=['admin']이고 user.role이 buyer이면 /promotions를 반환한다", () => {
    const result = resolveRedirect({
      accessToken: 'token',
      user: { role: 'buyer' },
      roles: ['admin'],
    });

    expect(result).toBe('/promotions');
  });

  it("roles=['buyer']이고 user.role이 admin이면 /admin/promotions를 반환한다", () => {
    const result = resolveRedirect({
      accessToken: 'token',
      user: { role: 'admin' },
      roles: ['buyer'],
    });

    expect(result).toBe('/admin/promotions');
  });

  it("roles=['admin']이고 user.role이 admin이면 null을 반환한다", () => {
    const result = resolveRedirect({
      accessToken: 'token',
      user: { role: 'admin' },
      roles: ['admin'],
    });

    expect(result).toBeNull();
  });

  it("roles=['buyer']이고 user.role이 buyer이면 null을 반환한다", () => {
    const result = resolveRedirect({
      accessToken: 'token',
      user: { role: 'buyer' },
      roles: ['buyer'],
    });

    expect(result).toBeNull();
  });

  it("roles에 여러 값이 있고 user.role이 그 중 하나와 일치하면 null을 반환한다", () => {
    const result = resolveRedirect({
      accessToken: 'token',
      user: { role: 'buyer' },
      roles: ['admin', 'buyer'],
    });

    expect(result).toBeNull();
  });
});
