/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import CanvasJSChart from './canvasjs'
import vuetify from './vuetify'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app.use(vuetify).use(CanvasJSChart)
}
