import { mount } from '@vue/test-utils'
import Vue from 'vue'
import { describe, expect, it } from 'vitest'
import ConfigForm from '../index.vue'

const benchmark = process.env.CONFIG_FORM_BENCHMARK === '1' ? it : it.skip
const ConfigFormForTest = ConfigForm as any

describe('ConfigForm performance baseline', () => {
  benchmark('mounts and updates a 200-field form', async () => {
    const fieldCount = 200
    const model = Object.fromEntries(
      Array.from({ length: fieldCount }, (_, index) => [`field${index}`, `value${index}`])
    )
    const items = Array.from({ length: fieldCount }, (_, index) => ({
      fieldKey: `field${index}`,
      type: 'input',
      colProps: { span: 6 }
    }))

    const mountStart = performance.now()
    const wrapper = mount(ConfigFormForTest, { propsData: { model, items } })
    await Vue.nextTick()
    const mountDuration = performance.now() - mountStart

    const updateStart = performance.now()
    wrapper.findAllComponents({ name: 'ElInput' }).at(100).vm.$emit('input', 'updated')
    await Vue.nextTick()
    const updateDuration = performance.now() - updateStart

    const nextModel = wrapper.emitted('update:model')?.[0]?.[0]
    expect(wrapper.findAllComponents({ name: 'ElInput' })).toHaveLength(fieldCount)
    expect(nextModel.field100).toBe('updated')
    expect(model.field100).toBe('value100')
    // 宽松上限只阻止数量级退化；具体数值用于本地版本间对比，不作为跨机器 SLA。
    expect(mountDuration).toBeLessThan(5000)
    expect(updateDuration).toBeLessThan(2000)
    console.log(JSON.stringify({ fieldCount, mountDuration, updateDuration }))
    wrapper.destroy()
  })
})
