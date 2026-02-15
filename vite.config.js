import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  root: '.',
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'assets/js/**/*', dest: 'assets/js' },
        { src: 'assets/css/**/*', dest: 'assets/css' },
        { src: 'assets/images/**/*', dest: 'assets/images' },
        { src: 'service-worker.js', dest: '.' },
        { src: 'manifest*.json', dest: '.' },
        { src: 'version.json', dest: '.' },
        { src: 'robots.txt', dest: '.' },
        { src: 'sitemap.xml', dest: '.' },
        { src: 'favicon.png', dest: '.' },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'index-en.html'),
        jp: resolve(import.meta.dirname, 'index-jp.html'),
        analysis: resolve(import.meta.dirname, 'analysis.html'),
        analysisEn: resolve(import.meta.dirname, 'analysis-en.html'),
        analysisJp: resolve(import.meta.dirname, 'analysis-jp.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: 'localhost',
  },
});
