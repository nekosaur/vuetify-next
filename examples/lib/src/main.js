import { createApp } from 'vue'
import { createVuetify, VAlert } from 'vuetify'
import App from './App.vue'

const app = createApp(App)

const vuetify = createVuetify({
  components: { VAlert },
})

app.use(vuetify)

app.mount('#app')
