import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

// @ts-ignore
import BootstrapVue3 from 'bootstrap-vue-3';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import LocalizationService from '@/services/LocalizationService'

import VColxx from "@/components/layout/VColxx.vue";


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
LocalizationService.detectAndSetLanguage()

app.use(BootstrapVue3);

app.component("b-colxx", VColxx);

app.mount('#app')
