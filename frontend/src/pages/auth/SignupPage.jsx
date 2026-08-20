import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../hooks/useAuth';
import { getSignupErrors } from '../../utils/validators';

function SignupPage() {
  const navigate = useNavigate();
  const signupMutation = useSignupMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = getSignupErrors({
      email,
      password,
      name,
      company_name: companyName,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    signupMutation.mutate(
      { email, password, name, company_name: companyName },
      {
        onSuccess: () => {
          navigate('/login');
        },
      }
    );
  };

  const serverErrorMessage = signupMutation.isError
    ? signupMutation.error?.response?.data?.error || '회원가입에 실패했습니다'
    : null;

  return (
    <div className="auth-page">
      <div className="auth-brand">CJ-Promo</div>
      <div className="auth-card">
        <h1>회원가입 (거래처 담당자)</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            {!fieldErrors.email && serverErrorMessage && (
              <div className="field-error">{serverErrorMessage}</div>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>
          <div className="form-field">
            <label htmlFor="name">이름</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>
          <div className="form-field">
            <label htmlFor="company_name">소속 거래처</label>
            <input
              id="company_name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {fieldErrors.company_name && (
              <div className="field-error">{fieldErrors.company_name}</div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={signupMutation.isPending}>
            가입하기
          </button>
        </form>
        <div className="form-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인으로 이동</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
