import { describe, it, expect } from 'vitest';
import { isValidEmail, getSignupErrors, getLoginErrors } from './validators.js';

describe('isValidEmail', () => {
  it('올바른 형식의 이메일이면 true를 반환한다', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
  });

  it('@가 없으면 false를 반환한다', () => {
    expect(isValidEmail('ab.com')).toBe(false);
  });

  it('null이면 false를 반환한다', () => {
    expect(isValidEmail(null)).toBe(false);
  });

  it('undefined이면 false를 반환한다', () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  it('빈 문자열이면 false를 반환한다', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('getSignupErrors', () => {
  it('모든 필드가 유효하면 빈 객체를 반환한다', () => {
    const errors = getSignupErrors({
      email: 'a@b.com',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(errors).toEqual({});
  });

  it('email이 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: '',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(errors.email).toBe('필수 입력값입니다');
  });

  it('email이 공백만 있으면 필수 입력값 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: '   ',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(errors.email).toBe('필수 입력값입니다');
  });

  it('email 형식이 올바르지 않으면 형식 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: 'invalid-email',
      password: 'password1',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(errors.email).toBe('올바른 이메일 형식이 아닙니다');
  });

  it('password가 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: 'a@b.com',
      password: '',
      name: '홍길동',
      company_name: '테스트회사',
    });

    expect(errors.password).toBe('필수 입력값입니다');
  });

  it('name이 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: 'a@b.com',
      password: 'password1',
      name: '',
      company_name: '테스트회사',
    });

    expect(errors.name).toBe('필수 입력값입니다');
  });

  it('company_name이 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: 'a@b.com',
      password: 'password1',
      name: '홍길동',
      company_name: '',
    });

    expect(errors.company_name).toBe('필수 입력값입니다');
  });

  it('여러 필드가 동시에 누락되면 각각 에러를 반환한다', () => {
    const errors = getSignupErrors({
      email: '',
      password: '',
      name: '',
      company_name: '',
    });

    expect(errors).toEqual({
      email: '필수 입력값입니다',
      password: '필수 입력값입니다',
      name: '필수 입력값입니다',
      company_name: '필수 입력값입니다',
    });
  });
});

describe('getLoginErrors', () => {
  it('모든 필드가 유효하면 빈 객체를 반환한다', () => {
    const errors = getLoginErrors({ email: 'a@b.com', password: 'password1' });

    expect(errors).toEqual({});
  });

  it('email이 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getLoginErrors({ email: '', password: 'password1' });

    expect(errors.email).toBe('필수 입력값입니다');
  });

  it('email 형식이 올바르지 않아도 형식 에러를 반환하지 않는다', () => {
    const errors = getLoginErrors({ email: 'invalid-email', password: 'password1' });

    expect(errors.email).toBeUndefined();
  });

  it('password가 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getLoginErrors({ email: 'a@b.com', password: '' });

    expect(errors.password).toBe('필수 입력값입니다');
  });

  it('email과 password가 모두 없으면 각각 에러를 반환한다', () => {
    const errors = getLoginErrors({ email: '', password: '' });

    expect(errors).toEqual({
      email: '필수 입력값입니다',
      password: '필수 입력값입니다',
    });
  });
});
