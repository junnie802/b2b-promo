import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    coverage: {
      // App.jsx/main.jsx는 UI 렌더링 컴포넌트라 자동테스트 대상에서 제외한다
      // (docs/5-project-principle.md 4절: 프론트 컴포넌트는 수동 확인으로 대체)
      // UI 렌더링 컴포넌트/얇은 훅 계층이라 자동테스트 대상에서 제외, docs/5-project-principle.md 4절 근거
      exclude: [
        'src/App.jsx',
        'src/main.jsx',
        '*.config.js',
        'src/pages/**',
        'src/hooks/useAuth.js',
        'src/components/layout/ProtectedRoute.jsx',
        'src/components/layout/Header.jsx',
        'src/components/common/Badge.jsx',
        'src/components/promotion/PromotionCard.jsx',
        'src/pages/promotions/**',
        'src/hooks/usePromotions.js',
        'src/hooks/useApplications.js',
        'src/hooks/useUser.js',
        'src/components/promotion/RouletteModal.jsx',
      ],
    },
  },
});
