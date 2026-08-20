import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PromotionListPage from './pages/promotions/PromotionListPage';
import PromotionDetailPage from './pages/promotions/PromotionDetailPage';
import MyApplicationsPage from './pages/promotions/MyApplicationsPage';
import PromotionAdminListPage from './pages/promotions/admin/PromotionAdminListPage';
import PromotionFormPage from './pages/promotions/admin/PromotionFormPage';
import PromotionApplicantsPage from './pages/promotions/admin/PromotionApplicantsPage';
import MyPage from './pages/mypage/MyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/promotions" element={<PromotionListPage />} />
          <Route path="/promotions/:id" element={<PromotionDetailPage />} />
          <Route path="/applications/me" element={<MyApplicationsPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/promotions" element={<PromotionAdminListPage />} />
          <Route path="/admin/promotions/new" element={<PromotionFormPage />} />
          <Route path="/admin/promotions/:id/edit" element={<PromotionFormPage />} />
          <Route path="/admin/promotions/:id/applicants" element={<PromotionApplicantsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
