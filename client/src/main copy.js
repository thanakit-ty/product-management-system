import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <--- ต้องมีบรรทัดนี้

const app = createApp(App)

app.use(router) // <--- ต้องมีบรรทัดนี้ เพื่อบอกว่าเราจะใช้ Router

app.mount('#app')