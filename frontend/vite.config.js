import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    coverage: {
      // App.jsx/main.jsx는 UI 렌더링 컴포넌트라 자동테스트 대상에서 제외한다
      // (docs/5-project-principle.md 4절: 프론트 컴포넌트는 수동 확인으로 대체)
      exclude: ['src/App.jsx', 'src/main.jsx', '*.config.js'],
    },
  },
});
