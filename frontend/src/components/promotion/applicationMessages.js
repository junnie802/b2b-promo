export function getApplyBlockedMessage(status) {
  if (status === 'active') return null;
  return '게시 중인 프로모션에만 참여 신청할 수 있습니다';
}
