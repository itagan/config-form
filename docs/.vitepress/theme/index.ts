import DefaultTheme from 'vitepress/theme'
import PlaygroundLink from './PlaygroundLink.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlaygroundLink', PlaygroundLink)
  }
}
