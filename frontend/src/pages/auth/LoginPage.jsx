import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../hooks/useAuth';
import { getLoginErrors } from '../../utils/validators';

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = getLoginErrors({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          navigate(data.user.role === 'admin' ? '/admin/promotions' : '/promotions');
        },
      }
    );
  };

  const serverErrorMessage =
    loginMutation.error?.response?.data?.error ||
    (loginMutation.isError ? '이메일 또는 비밀번호가 일치하지 않습니다' : null);

  return (
    <div className="auth-page">
      <div className="auth-brand">CJ-Promo</div>
      <div className="auth-card">
        <h1>로그인</h1>
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

          {serverErrorMessage && <div className="field-error">{serverErrorMessage}</div>}

          <button type="submit" className="btn-primary" disabled={loginMutation.isPending}>
            로그인
          </button>
        </form>
        <div className="form-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
