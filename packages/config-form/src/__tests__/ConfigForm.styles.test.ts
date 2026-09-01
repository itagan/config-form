import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import Vue from 'vue'
import { describe, expect, it } from 'vitest'
import ConfigForm from '../index.vue'

const ConfigFormForTest = ConfigForm as any

const CustomField = Vue.extend({
  name: 'CustomField',
  props: ['value'],
  render: h => h('div', { class: 'custom-field-root' })
})

describe('ConfigForm standalone styles', () => {
  const componentSource = fs.readFileSync(path.resolve(process.cwd(), 'src/index.vue'), 'utf8')

  it('marks every FormItem and fills fixed-width builtin controls to the column', async () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { number: 1, date: '', time: '', timeSelect: '', input: '', custom: '' },
        items: [
          { fieldKey: 'number', type: 'number', component: { props: { class: 'business-number' } } },
          { fieldKey: 'date', type: 'date' },
          { fieldKey: 'time', type: 'time' },
          { fieldKey: 'timeSelect', type: 'time-select', component: { props: { style: { width: '160px' } } } },
          { fieldKey: 'input', type: 'input' },
          { fieldKey: 'custom', type: 'component', component: { is: CustomField } }
        ]
      }
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.config-form-form-item')).toHaveLength(6)

    const fullWidthControls = wrapper.findAll('.config-form-field-control--full')
    expect(fullWidthControls).toHaveLength(4)
    expect(wrapper.find('.el-input-number').classes())
      .toEqual(expect.arrayContaining(['config-form-field-control--full', 'business-number']))
    expect(wrapper
      .find('[data-config-form-field-prop="input"]')
      .find('.el-input')
      .classes()).not.toContain('config-form-field-control--full')
    expect(wrapper.find('.custom-field-root').classes())
      .not.toContain('config-form-field-control--full')
    expect(componentSource).toContain('.config-form-form-item .config-form-field-control--full')
    expect(componentSource).toContain('width: 100%')

    wrapper.destroy()
  })

  it('merges business formItemProps classes with the marker class', async () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: '' },
        items: [{
          fieldKey: 'name',
          type: 'input',
          formItemProps: { class: 'business-form-item', style: { marginBottom: '12px' } }
        }]
      }
    })
    await wrapper.vm.$nextTick()

    const formItem = wrapper.find('.config-form-form-item')
    expect(formItem.classes()).toContain('el-form-item')
    expect(formItem.classes()).toContain('business-form-item')

    wrapper.destroy()
  })
})
