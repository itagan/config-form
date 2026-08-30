import { mount } from '@vue/test-utils'
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

describe('ConfigForm interaction strategies', () => {
  it('uses native readonly for compatible built-in fields', () => {
    const wrapper = mountForm({
      propsData: {
        model: { name: 'Ada' },
        items: [{ fieldKey: 'name', type: 'input', readonly: true }]
      }
    })

    const input = wrapper.findComponent({ name: 'ElInput' })
    expect(input.props('readonly')).toBe(true)
    expect(input.props('disabled')).toBe(false)
  })

  it('falls back to disabled for controls without native readonly', () => {
    const wrapper = mountForm({
      propsData: {
        model: { status: 'enabled' },
        items: [{
          fieldKey: 'status',
          type: 'select',
          readonly: true,
          component: { options: [{ label: '启用', value: 'enabled' }] }
        }]
      }
    })

    expect(wrapper.findComponent({ name: 'ElSelect' }).props('disabled')).toBe(true)
  })

  it('allows callers to override the readonly strategy', () => {
    const wrapper = mountForm({
      propsData: {
        model: { name: 'Ada', status: 'enabled' },
        items: [
          {
            fieldKey: 'name',
            type: 'input',
            readonly: true,
            readonlyStrategy: 'disabled'
          },
          {
            fieldKey: 'status',
            type: 'select',
            readonly: true,
            readonlyStrategy: 'native'
          }
        ]
      }
    })

    expect(wrapper.findComponent({ name: 'ElInput' }).props('disabled')).toBe(true)
    expect(wrapper.findComponent({ name: 'ElSelect' }).props('disabled')).toBe(false)
    expect(wrapper.findComponent({ name: 'ElSelect' }).attributes('readonly')).toBe('readonly')
  })

  it('uses cloneModel when resetting complex business models', async () => {
    const source = { profile: { name: 'Ada' } }
    const cloneModel = (model: typeof source) => ({ profile: { name: model.profile.name } })
    const wrapper = mountForm({
      propsData: {
        model: source,
        cloneModel,
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
