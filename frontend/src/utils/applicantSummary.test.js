import { describe, it, expect } from 'vitest';
import { summarizeApplicants } from './applicantSummary.js';

describe('summarizeApplicants', () => {
  it('빈 배열이면 total/applied/cancelled 모두 0을 반환한다', () => {
    expect(summarizeApplicants([])).toEqual({ total: 0, applied: 0, cancelled: 0 });
  });

  it('applied 2건, cancelled 1건이 섞인 배열을 집계한다', () => {
    const applicants = [
      { status: 'applied' },
      { status: 'cancelled' },
      { status: 'applied' },
    ];

    expect(summarizeApplicants(applicants)).toEqual({ total: 3, applied: 2, cancelled: 1 });
  });

  it('모두 applied인 배열이면 cancelled는 0이다', () => {
    const applicants = [{ status: 'applied' }, { status: 'applied' }];

    const result = summarizeApplicants(applicants);

    expect(result.cancelled).toBe(0);
  });
});
