export function getApplicationStatusLabel(status) {
  if (status === 'applied') return '신청';
  if (status === 'cancelled') return '취소';
  return '';
}
