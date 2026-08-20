import { useEffect, useState } from 'react';
import { useMeQuery, useUpdateMeMutation, useChangePasswordMutation } from '../../hooks/useUser';
import { getProfileFormErrors, getPasswordFormErrors } from '../../utils/userFormValidation';

const TABS = {
  PROFILE: '내 정보 수정',
  PASSWORD: '비밀번호 변경',
};

function ProfileForm({ me }) {
  const updateMutation = useUpdateMeMutation();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !me) return;
    setName(me.name || '');
    setCompanyName(me.company_name || '');
    setInitialized(true);
  }, [me, initialized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = getProfileFormErrors({ name, company_name: companyName });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    updateMutation.mutate({ name, company_name: companyName });
  };

  const serverErrorMessage = updateMutation.isError
    ? updateMutation.error?.response?.data?.error || '저장에 실패했습니다'
    : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label>이메일 (수정불가)</label>
        <div className="field-readonly">{me.email}</div>
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
        {fieldErrors.company_name && <div className="field-error">{fieldErrors.company_name}</div>}
      </div>

      {serverErrorMessage && <div className="apply-error-message">{serverErrorMessage}</div>}
      {updateMutation.isSuccess && <div className="apply-success-message">저장되었습니다</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
          저장
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const changePasswordMutation = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    const errors = getPasswordFormErrors({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    changePasswordMutation.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setNewPasswordConfirm('');
          setSuccessMessage('비밀번호가 변경되었습니다');
        },
      }
    );
  };

  const serverErrorMessage = changePasswordMutation.isError
    ? changePasswordMutation.error?.response?.data?.error || '비밀번호 변경에 실패했습니다'
    : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="current_password">현재 비밀번호</label>
        <input
          id="current_password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        {fieldErrors.current_password && (
          <div className="field-error">{fieldErrors.current_password}</div>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="new_password">새 비밀번호</label>
        <input
          id="new_password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {fieldErrors.new_password && <div className="field-error">{fieldErrors.new_password}</div>}
      </div>
      <div className="form-field">
        <label htmlFor="new_password_confirm">새 비밀번호 확인</label>
        <input
          id="new_password_confirm"
          type="password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
        />
        {fieldErrors.new_password_confirm && (
          <div className="field-error">{fieldErrors.new_password_confirm}</div>
        )}
      </div>

      {serverErrorMessage && <div className="apply-error-message">{serverErrorMessage}</div>}
      {successMessage && <div className="apply-success-message">{successMessage}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={changePasswordMutation.isPending}>
          변경
        </button>
      </div>
    </form>
  );
}

function MyPage() {
  const meQuery = useMeQuery();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);

  if (meQuery.isLoading) {
    return <p className="list-status-message">불러오는 중입니다...</p>;
  }
  if (meQuery.isError) {
    return <p className="list-status-message">정보를 불러오지 못했습니다</p>;
  }

  return (
    <div className="promotion-list-page">
      <h1>마이페이지</h1>
      <div className="mypage-tabs">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`mypage-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === TABS.PROFILE && <ProfileForm me={meQuery.data} />}
      {activeTab === TABS.PASSWORD && <PasswordForm />}
    </div>
  );
}

export default MyPage;
