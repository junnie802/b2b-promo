export function getProfileFormErrors({ name, company_name }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = '필수 입력값입니다';
  if (!company_name || !company_name.trim()) errors.company_name = '필수 입력값입니다';
  return errors;
}

export function getPasswordFormErrors({ current_password, new_password, new_password_confirm }) {
  const errors = {};
  if (!current_password || !current_password.trim()) {
    errors.current_password = '필수 입력값입니다';
  }
  if (!new_password || !new_password.trim()) {
    errors.new_password = '필수 입력값입니다';
  } else if (new_password.length < 8) {
    errors.new_password = '비밀번호는 8자 이상이어야 합니다';
  }
  if (new_password_confirm !== new_password) {
    errors.new_password_confirm = '새 비밀번호가 일치하지 않습니다';
  }
  return errors;
}
