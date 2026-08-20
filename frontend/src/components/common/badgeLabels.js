const STATUS_LABELS = {
  scheduled: '예정',
  active: '진행',
  ended: '종료',
};

const TYPE_LABELS = {
  discount: '가격할인',
  gift: '사은품증정',
  tasting: '신제품시식',
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? '';
}

export function getTypeLabel(type) {
  return TYPE_LABELS[type] ?? '';
}
