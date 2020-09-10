import { defineComponent, h } from 'vue'
import { VAlert } from 'vuetify'

export default defineComponent({
  setup () {
    return () => h(VAlert, { type: 'success' }, () => 'hello')
  }
})
