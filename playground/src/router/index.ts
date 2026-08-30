import Vue from 'vue'
import VueRouter from 'vue-router'
import BasicView from '../views/BasicView.vue'
import DynamicView from '../views/DynamicView.vue'
import SchemaView from '../views/SchemaView.vue'
import OptionsView from '../views/OptionsView.vue'
import ExtensionsView from '../views/ExtensionsView.vue'
import ReadonlyView from '../views/ReadonlyView.vue'
import InteractionView from '../views/InteractionView.vue'
import HintView from '../views/HintView.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: BasicView },
    { path: '/options', component: OptionsView },
    { path: '/dynamic', component: DynamicView },
    { path: '/schema', component: SchemaView },
    { path: '/extensions', component: ExtensionsView },
    { path: '/readonly', component: ReadonlyView },
    { path: '/interaction', component: InteractionView },
    { path: '/hints', component: HintView }
  ]
})
