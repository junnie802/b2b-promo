import { describe, it, expect } from 'vitest';
import { getPromotionFormErrors } from './promotionFormValidation.js';

describe('getPromotionFormErrors', () => {
  it('type이 없으면 필수 입력값 에러를 포함한다', () => {
    const errors = getPromotionFormErrors({
      type: '',
      title: '프로모션',
      start_date: '2026-08-20',
      end_date: '2026-08-30',
    });

    expect(errors.type).toBe('필수 입력값입니다');
  });

  it('title이 공백만 있으면 필수 입력값 에러를 포함한다', () => {
    const errors = getPromotionFormErrors({
      type: 'discount',
      title: '   ',
      start_date: '2026-08-20',
      end_date: '2026-08-30',
    });

    expect(errors.title).toBe('필수 입력값입니다');
  });

  it('start_date가 없으면 필수 입력값 에러를 포함한다', () => {
    const errors = getPromotionFormErrors({
      type: 'discount',
      title: '프로모션',
      start_date: '',
      end_date: '2026-08-30',
    });

    expect(errors.start_date).toBe('필수 입력값입니다');
  });

  it('end_date가 없으면 필수 입력값 에러를 포함한다', () => {
    const errors = getPromotionFormErrors({
      type: 'discount',
      title: '프로모션',
      start_date: '2026-08-20',
      end_date: '',
    });

    expect(errors.end_date).toBe('필수 입력값입니다');
  });

  it('여러 필드가 동시에 누락되면 각각의 에러를 모두 포함한다', () => {
    const errors = getPromotionFormErrors({
      type: '',
      title: '',
      start_date: '',
      end_date: '',
    });

    expect(errors).toEqual({
      type: '필수 입력값입니다',
      title: '필수 입력값입니다',
      start_date: '필수 입력값입니다',
      end_date: '필수 입력값입니다',
    });
  });

  it('4개 필드 모두 유효하면 빈 객체를 반환한다', () => {
    const errors = getPromotionFormErrors({
      type: 'discount',
      title: '프로모션',
      start_date: '2026-08-20',
      end_date: '2026-08-30',
    });

    expect(errors).toEqual({});
  });
});
