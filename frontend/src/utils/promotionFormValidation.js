export function getPromotionFormErrors({ type, title, start_date, end_date }) {
  const errors = {};
  if (!type) errors.type = '필수 입력값입니다';
  if (!title || !title.trim()) errors.title = '필수 입력값입니다';
  if (!start_date) errors.start_date = '필수 입력값입니다';
  if (!end_date) errors.end_date = '필수 입력값입니다';
  return errors;
}
