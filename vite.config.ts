import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' assert { type: 'json' }; // Node >=17
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default ({ mode }) => {
  const isProduction = mode === 'production';
  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [vue(), crx({ manifest }), vuetify({ autoImport: true })],
    build: {
      // build.minify
      // https://ja.vitejs.dev/config/build-options.html#build-minify
      minify: isProduction,
    },
    esbuild: {
      // https://esbuild.github.io/api/#drop
      drop: isProduction ? ['console', 'debugger'] : undefined,
    },
  });
};
