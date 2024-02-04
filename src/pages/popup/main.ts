import { createApp } from 'vue';
import '../../style.css';
import App from './App.vue';
import vuetify from '../../plugins/vuetify';

const app = createApp(App);

// Vuetify
app.use(vuetify);

app.mount('#app');
