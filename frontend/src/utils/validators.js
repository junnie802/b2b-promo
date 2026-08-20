const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_MESSAGE = '필수 입력값입니다';
const EMAIL_FORMAT_MESSAGE = '올바른 이메일 형식이 아닙니다';

export function isValidEmail(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}

function isBlank(value) {
  return !value || !String(value).trim();
}

export function getSignupErrors({ email, password, name, company_name }) {
  const errors = {};

  if (isBlank(email)) {
    errors.email = REQUIRED_MESSAGE;
  } else if (!isValidEmail(email)) {
    errors.email = EMAIL_FORMAT_MESSAGE;
  }

  if (isBlank(password)) errors.password = REQUIRED_MESSAGE;
  if (isBlank(name)) errors.name = REQUIRED_MESSAGE;
  if (isBlank(company_name)) errors.company_name = REQUIRED_MESSAGE;

  return errors;
}

export function getLoginErrors({ email, password }) {
  const errors = {};

  if (isBlank(email)) errors.email = REQUIRED_MESSAGE;
  if (isBlank(password)) errors.password = REQUIRED_MESSAGE;

  return errors;
}
