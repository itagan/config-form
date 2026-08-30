import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConfigForm from '../index.vue'
import type { ConfigFormFieldBindingContext } from '../types'

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

describe('ConfigForm Element prop passthrough', () => {
  it('uses component props for field interaction state', () => {
    const wrapper = mountForm({
      propsData: {
        model: { name: 'Ada' },
        items: [{ fieldKey: 'name', type: 'input', component: { props: { readonly: true } } }]
      }
    })

    const input = wrapper.findComponent({ name: 'ElInput' })
    expect(input.props('readonly')).toBe(true)
    expect(input.props('disabled')).toBe(false)
  })

  it('uses el-form disabled for native state propagation', () => {
    const wrapper = mountForm({
      propsData: {
        model: { status: 'enabled' },
        formProps: { disabled: true },
        items: [{
          fieldKey: 'status',
          type: 'select',
          component: { options: [{ label: '启用', value: 'enabled' }] }
        }]
      }
    })

    expect(wrapper.findComponent({ name: 'ElForm' }).props('disabled')).toBe(true)
  })

  it('resolves dynamic component props with bindingValue', () => {
    const BindingProbe = {
      name: 'BindingProbe',
      props: ['value', 'title'],
      render(createElement: any) { return createElement('span') }
    }
    const wrapper = mountForm({
      propsData: {
        model: { amount: 12, currency: 'CNY' },
        items: [{
          fieldKey: 'amount',
          type: 'component',
          binding: { map: [{ fieldPath: 'amount', valuePath: 'amount' }, { fieldPath: 'currency', valuePath: 'currency' }] },
          component: {
            is: BindingProbe,
            props: (context: ConfigFormFieldBindingContext) => ({ title: context.bindingValue.currency })
          }
        }]
      }
    })

    expect(wrapper.findComponent(BindingProbe).props('title')).toBe('CNY')
  })

  it('resets from the internal model snapshot', async () => {
    const source = { profile: { name: 'Ada' } }
    const wrapper = mountForm({
      propsData: {
        model: source,
        items: [{ fieldKey: 'profile.name', type: 'input' }]
      }
    })

    await wrapper.setProps({ model: { profile: { name: 'Grace' } } })
    ;(wrapper.vm as any).resetFields()

    expect(wrapper.emitted('update:model')?.[0]?.[0]).toEqual(source)
    expect(wrapper.emitted('update:model')?.[0]?.[0]).not.toBe(source)
  })

  it('keeps captured field contexts live after controlled model updates', async () => {
    const onChange = vi.fn()
    const wrapper = mountForm({
      propsData: {
        model: { profile: { name: 'Ada' } },
        items: [{
          fieldKey: 'profile.name',
          type: 'input',
          component: { listeners: { change: onChange } }
        }]
      }
    })

    wrapper.findComponent({ name: 'ElInput' }).vm.$emit('change', 'Ada')
    const context = onChange.mock.calls[0][0]
    await wrapper.setProps({ model: { profile: { name: 'Grace' } } })

    expect(context.value).toBe('Grace')
    expect(context.bindingValue).toBe('Grace')
  })
})
