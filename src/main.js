import './assets/main.css'
import 'aos/dist/aos.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vue3GoogleLogin from 'vue3-google-login'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'

const head = createHead()
const app = createApp(App)

app.use(head)
app.use(createPinia())
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here'
})

app.mount('#app')

