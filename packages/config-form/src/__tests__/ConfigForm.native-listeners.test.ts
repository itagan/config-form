import { mount } from '@vue/test-utils'
import Vue from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConfigForm from '../index.vue'

const ConfigFormForTest = ConfigForm as any
const wrappers: Array<ReturnType<typeof mount>> = []

function mountForm(options: any) {
  const wrapper = mount(ConfigFormForTest, options)
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.destroy())
})

describe('ConfigForm component native listeners', () => {
  it('listens to a readonly Element Input root DOM event with the current field context', async () => {
    const click = vi.fn()
    const wrapper = mountForm({
      propsData: {
        model: { name: 'Ada' },
        items: [{
          fieldKey: 'name',
          type: 'input',
          component: {
            props: { readonly: true },
            nativeListeners: { click }
          }
        }]
      }
    })
    await wrapper.setProps({ model: { name: 'Alicia' } })
    await Vue.nextTick()

    await wrapper.find('.el-input__inner').trigger('click')

    expect(click).toHaveBeenCalledTimes(1)
    expect(click.mock.calls[0][0]).toMatchObject({
      fieldKey: 'name',
      value: 'Alicia',
      model: { name: 'Alicia' }
    })
    expect(click.mock.calls[0][1]).toBeInstanceOf(MouseEvent)
  })

  it('keeps component and native events independent on a direct component', async () => {
    const componentClick = vi.fn()
    const nativeClick = vi.fn()
    const ClickableField = {
      name: 'ClickableField',
      props: ['value'],
      render(this: any, h: any) {
        return h('button', {
          class: 'clickable-field',
          attrs: { type: 'button' },
          on: { click: () => this.$emit('click', 'component-event') }
        }, this.value)
      }
    }
    const wrapper = mountForm({
      propsData: {
        model: { name: 'Ada' },
        items: [{
          fieldKey: 'name',
          type: 'component',
          component: {
            is: ClickableField,
            listeners: { click: componentClick },
            nativeListeners: { click: nativeClick }
          }
        }]
      }
    })
    await Vue.nextTick()

    await wrapper.find('.clickable-field').trigger('click')

    expect(componentClick).toHaveBeenCalledTimes(1)
    expect(componentClick.mock.calls[0].slice(1)).toEqual(['component-event'])
    expect(nativeClick).toHaveBeenCalledTimes(1)
    expect(nativeClick.mock.calls[0][1]).toBeInstanceOf(MouseEvent)
  })

  it('merges text listeners before native listeners for the same DOM event', async () => {
    const calls: string[] = []
    const wrapper = mountForm({
      propsData: {
        model: { summary: '只读摘要' },
        items: [{
          fieldKey: 'summary',
          type: 'text',
          component: {
            props: { class: 'clickable-summary' },
            listeners: { click: () => calls.push('listener') },
            nativeListeners: { click: () => calls.push('native-listener') }
          }
        }]
      }
    })
    await Vue.nextTick()

    await wrapper.find('.clickable-summary').trigger('click')

    expect(calls).toEqual(['listener', 'native-listener'])
  })

  it('supports native listeners on registered field types', async () => {
    const click = vi.fn()
    const RegisteredField = {
      name: 'RegisteredField',
      props: ['value'],
      render(this: any, h: any) {
        return h('span', { class: 'registered-field' }, this.value)
      }
    }
    const wrapper = mountForm({
      propsData: {
        model: { status: 'enabled' },
        fieldTypes: { status: { is: RegisteredField } },
        items: [{
          fieldKey: 'status',
          type: 'status',
          component: { nativeListeners: { click } }
        }]
      }
    })
    await Vue.nextTick()

    await wrapper.find('.registered-field').trigger('click')

    expect(click).toHaveBeenCalledTimes(1)
    expect(click.mock.calls[0][0]).toMatchObject({ fieldKey: 'status', value: 'enabled' })
    expect(click.mock.calls[0][1]).toBeInstanceOf(MouseEvent)
  })
})
