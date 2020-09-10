import { createApp } from 'vue'
import Playground from './Playground.vue'
import { createVuetify } from '/src/full.ts'

const app = createApp(Playground)
const vuetify = createVuetify()

app.use(vuetify)

app.mount('#app')
