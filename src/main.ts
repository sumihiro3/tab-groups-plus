import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import vuetify from './plugins/vuetify';
import ja from './assets/lang/ja.json';
import en from './assets/lang/en.json';

const app = createApp(App);

// 多言語対応
const i18n = createI18n({
  legacy: false,
  locale: 'ja',
  fallbackLocale: 'en',
  messages: {
    ja: ja,
    en: en,
    // ja: {
    //   Hello: 'ハロー',
    //   World: 'ワールド',
    //   tabGroups: {
    //     input_query: '入力してタブグループを検索',
    //   },
    // },
    // en: {
    //   Hello: 'Hello',
    //   World: 'World',
    //   tabGroups: {
    //     input_query: 'Enter and search tab group',
    //   },
    // },
  },
});
app.use(i18n);
app.use(vuetify);

app.mount('#app');
