import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json' assert { type: 'json' };
const { version } = packageJson;
// import manifest from './manifest.config.ts'; // Node >=17
import vuetify from 'vite-plugin-vuetify';

// manifest.json
const manifest = defineManifest(async (env) => ({
  manifest_version: 3,
  name: '__MSG_extension_name__',
  description: '__MSG_extension_description__',
  version: version,
  default_locale: 'en',
  icons: {
    '16': 'src/assets/icon/icon-16.png',
    '32': 'src/assets/icon/icon-32.png',
    '48': 'src/assets/icon/icon-48.png',
    '128': 'src/assets/icon/icon-128.png',
  },
  action: {
    default_title: '__MSG_popup_page_title__',
    default_popup: 'src/pages/popup/index.html',
  },
  options_page: 'src/pages/options/index.html',
  commands: {
    _execute_action: {
      suggested_key: {
        windows: 'Ctrl+Shift+P',
        mac: 'Command+Shift+P',
        chromeos: 'Ctrl+Shift+P',
        linux: 'Ctrl+Shift+P',
      },
      description: '__MSG_shortcut_key_description__',
    },
  },
  permissions: ['commands', 'storage', 'tabGroups', 'tabs'],
}));

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
      rollupOptions: {
        input: {
          // ポップアップ
          popup: 'src/pages/popup/index.html',
          // 設定画面
          options: 'src/pages/options/index.html',
        },
      },
    },
    esbuild: {
      // https://esbuild.github.io/api/#drop
      // drop: isProduction ? ['console', 'debugger'] : undefined,
    },
  });
};
