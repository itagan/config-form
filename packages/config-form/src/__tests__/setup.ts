import Vue from 'vue'
import ElementUI from 'element-ui'
import { config } from '@vue/test-utils'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(ElementUI)

// transition stub 会渲染成额外元素，干扰按 DOM 结构解析内容的提示定位。
config.stubs.transition = false
config.stubs['transition-group'] = false
