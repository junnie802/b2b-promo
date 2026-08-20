import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogoutMutation } from '../../hooks/useAuth';

function Header() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/login');
      },
    });
  };

  return (
    <header className={`app-header${menuOpen ? ' menu-open' : ''}`}>
      <div className="app-header-brand">{isAdmin ? 'CJ-Promo(관리자)' : 'CJ-Promo'}</div>
      <button
        type="button"
        className="app-header-hamburger"
        aria-label="메뉴 열기"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        ☰
      </button>
      <nav className="app-header-menu">
        {isAdmin ? (
          <>
            <Link to="/admin/promotions" onClick={() => setMenuOpen(false)}>
              프로모션관리
            </Link>
            <Link to="/mypage" onClick={() => setMenuOpen(false)}>
              마이페이지
            </Link>
          </>
        ) : (
          <>
            <Link to="/promotions" onClick={() => setMenuOpen(false)}>
              프로모션
            </Link>
            <Link to="/applications/me" onClick={() => setMenuOpen(false)}>
              내 신청
            </Link>
            <Link to="/mypage" onClick={() => setMenuOpen(false)}>
              마이페이지
            </Link>
          </>
        )}
      </nav>
      <div className="app-header-user">
        <span>{user?.name}</span>
        <button type="button" className="app-header-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
