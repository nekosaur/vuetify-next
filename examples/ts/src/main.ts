import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App'

const app = createApp(App)

const vuetify = createVuetify()

app.use(vuetify)

app.mount('#app')
