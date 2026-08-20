import { describe, it, expect } from 'vitest';
import { getApplyBlockedMessage } from './applicationMessages.js';

describe('getApplyBlockedMessage', () => {
  it("status가 'active'이면 null을 반환한다", () => {
    expect(getApplyBlockedMessage('active')).toBeNull();
  });

  it("status가 'scheduled'이면 안내 메시지를 반환한다", () => {
    expect(getApplyBlockedMessage('scheduled')).toBe(
      '게시 중인 프로모션에만 참여 신청할 수 있습니다'
    );
  });

  it("status가 'ended'이면 안내 메시지를 반환한다", () => {
    expect(getApplyBlockedMessage('ended')).toBe(
      '게시 중인 프로모션에만 참여 신청할 수 있습니다'
    );
  });
});
