import { describe, it, expect } from 'vitest';
import { getApplicationStatusLabel } from './applicationStatusLabels.js';

describe('getApplicationStatusLabel', () => {
  it("'applied'이면 '신청'을 반환한다", () => {
    expect(getApplicationStatusLabel('applied')).toBe('신청');
  });

  it("'cancelled'이면 '취소'를 반환한다", () => {
    expect(getApplicationStatusLabel('cancelled')).toBe('취소');
  });

  it('알 수 없는 값이면 빈 문자열을 반환한다', () => {
    expect(getApplicationStatusLabel('unknown')).toBe('');
  });
});
