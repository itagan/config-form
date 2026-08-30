import Vue from 'vue'
import ElementUI from 'element-ui'
import { config } from '@vue/test-utils'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(ElementUI)

// jsdom 的 requestAnimationFrame 使用窗口销毁后的定时器，组件卸载时可能在环境清理后触发。
// 单测不验证逐帧动画，改为同步执行以避免跨测试环境悬空任务。
window.requestAnimationFrame = callback => {
  callback(performance.now())
  return 0
}
window.cancelAnimationFrame = () => undefined

// transition stub 会渲染成额外元素，干扰按 DOM 结构解析内容的提示定位。
config.stubs.transition = false
config.stubs['transition-group'] = false
