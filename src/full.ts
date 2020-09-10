import * as components from './components'
import * as framework from './framework'

export * from './components'
export * from './framework'

export const createVuetify = (options: any = {}) => {
  return framework.createVuetify({ components, ...options })
}
