import { InjectionKey, warn, inject, App } from 'vue'

export interface VuetifyInstance {}

export const VuetifySymbol: InjectionKey<VuetifyInstance> = Symbol.for('vuetify')

export const useVuetify = () => {
  const vuetify = inject(VuetifySymbol)

  if (!vuetify) {
    warn('Vuetify has not been installed on this app')
  }

  return vuetify
}

export const createVuetify = (options: any = {}) => {
  const install = (app: App) => {
    console.log('Installing Vuetify...')

    const {
      components = {},
      directives = {},
    } = options

    for (const key in directives) {
      const directive = directives[key]

      app.directive(key, directive)
    }

    for (const key in components) {
      const component = components[key]

      app.component(key, component)
    }

    const vuetify = {}

    app.provide(VuetifySymbol, vuetify)
  }

  return {
    install,
  }
}
