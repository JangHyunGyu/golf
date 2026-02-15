import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'swing-ai',
  brand: {
    displayName: 'SWING AI',
    primaryColor: '#31f662', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://golf.archerlab.dev/favicon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
