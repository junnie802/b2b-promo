import { describe, it, expect } from 'vitest';
import { getProfileFormErrors, getPasswordFormErrors } from './userFormValidation.js';

describe('getProfileFormErrors', () => {
  it('name이 빈 문자열이면 필수 입력값 에러를 반환한다', () => {
    const errors = getProfileFormErrors({ name: '', company_name: '테스트회사' });

    expect(errors.name).toBe('필수 입력값입니다');
  });

  it('name이 공백만 있으면 필수 입력값 에러를 반환한다', () => {
    const errors = getProfileFormErrors({ name: '   ', company_name: '테스트회사' });

    expect(errors.name).toBe('필수 입력값입니다');
  });

  it('company_name이 빈 문자열이면 필수 입력값 에러를 반환한다', () => {
    const errors = getProfileFormErrors({ name: '홍길동', company_name: '' });

    expect(errors.company_name).toBe('필수 입력값입니다');
  });

  it('company_name이 공백만 있으면 필수 입력값 에러를 반환한다', () => {
    const errors = getProfileFormErrors({ name: '홍길동', company_name: '   ' });

    expect(errors.company_name).toBe('필수 입력값입니다');
  });

  it('모두 유효하면 빈 객체를 반환한다', () => {
    const errors = getProfileFormErrors({ name: '홍길동', company_name: '테스트회사' });

    expect(errors).toEqual({});
  });
});

describe('getPasswordFormErrors', () => {
  it('current_password가 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getPasswordFormErrors({
      current_password: '',
      new_password: 'password1',
      new_password_confirm: 'password1',
    });

    expect(errors.current_password).toBe('필수 입력값입니다');
  });

  it('new_password가 없으면 필수 입력값 에러를 반환한다', () => {
    const errors = getPasswordFormErrors({
      current_password: 'oldpassword',
      new_password: '',
      new_password_confirm: '',
    });

    expect(errors.new_password).toBe('필수 입력값입니다');
  });

  it('new_password가 8자 미만이면 길이 에러를 반환한다', () => {
    const errors = getPasswordFormErrors({
      current_password: 'oldpassword',
      new_password: 'short1',
      new_password_confirm: 'short1',
    });

    expect(errors.new_password).toBe('비밀번호는 8자 이상이어야 합니다');
  });

  it('new_password_confirm이 new_password와 다르면 불일치 에러를 반환한다', () => {
    const errors = getPasswordFormErrors({
      current_password: 'oldpassword',
      new_password: 'password1',
      new_password_confirm: 'password2',
    });

    expect(errors.new_password_confirm).toBe('새 비밀번호가 일치하지 않습니다');
  });

  it('모두 유효하면 빈 객체를 반환한다', () => {
    const errors = getPasswordFormErrors({
      current_password: 'oldpassword',
      new_password: 'password1',
      new_password_confirm: 'password1',
    });

    expect(errors).toEqual({});
  });

  it('new_password가 8자 미만이면서 new_password_confirm도 다르면 두 에러가 동시에 발생한다', () => {
    const errors = getPasswordFormErrors({
      current_password: 'oldpassword',
      new_password: 'short1',
      new_password_confirm: 'different',
    });

    expect(errors).toEqual({
      new_password: '비밀번호는 8자 이상이어야 합니다',
      new_password_confirm: '새 비밀번호가 일치하지 않습니다',
    });
  });
});
