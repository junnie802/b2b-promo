import { describe, it, expect } from 'vitest';
import { getStatusLabel, getTypeLabel } from './badgeLabels.js';

describe('getStatusLabel', () => {
  it("'scheduled'이면 '예정'을 반환한다", () => {
    expect(getStatusLabel('scheduled')).toBe('예정');
  });

  it("'active'이면 '진행'을 반환한다", () => {
    expect(getStatusLabel('active')).toBe('진행');
  });

  it("'ended'이면 '종료'를 반환한다", () => {
    expect(getStatusLabel('ended')).toBe('종료');
  });

  it('알 수 없는 값이면 빈 문자열을 반환한다', () => {
    expect(getStatusLabel('unknown')).toBe('');
  });
});

describe('getTypeLabel', () => {
  it("'discount'이면 '가격할인'을 반환한다", () => {
    expect(getTypeLabel('discount')).toBe('가격할인');
  });

  it("'gift'이면 '사은품증정'을 반환한다", () => {
    expect(getTypeLabel('gift')).toBe('사은품증정');
  });

  it("'tasting'이면 '신제품시식'을 반환한다", () => {
    expect(getTypeLabel('tasting')).toBe('신제품시식');
  });

  it('알 수 없는 값이면 빈 문자열을 반환한다', () => {
    expect(getTypeLabel('unknown')).toBe('');
  });
});
