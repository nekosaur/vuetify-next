import { defineComponent, h } from 'vue'
export const VBtn = defineComponent({
  name: 'VBtn',
  props: {},
  setup (_, { slots }) {
    return () => h('button', slots.default && slots.default())
  },
})
