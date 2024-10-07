import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/dark/css-vars.css'
import "./styles/index.css";
import './styles/global-overrides.css'
import router from './router';
import api from './utils/api';

const app = createApp(App);

app.config.globalProperties.$axios = api;
app.use(ElementPlus);
app.use(router);
app.mount('#app');