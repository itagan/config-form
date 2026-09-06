import { mount } from '@vue/test-utils'
import Vue, { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ConfigForm from '../index.vue'

const ConfigFormForTest = ConfigForm as any

describe('native component slots', () => {
  it('renders Input slots through $slots and keeps model updates and listeners', async () => {
    const onInput = vi.fn()
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: 'Ada' },
        items: [{ fieldKey: 'name', type: 'input', component: {
          slots: { prepend: 'prefix', append: 'action' }, listeners: { input: onInput }
        } }]
      },
      scopedSlots: {
        prefix: '<span>{{ props.field.value }}</span>',
        action: '<button @click="props.field.setValue(\'Grace\')">更新</button>'
      }
    })
    expect(wrapper.find('.el-input-group__prepend').text()).toBe('Ada')
    await wrapper.find('.el-input-group__append button').trigger('click')
    expect(wrapper.emitted('update:model')![0][0]).toEqual({ name: 'Grace' })
    await wrapper.setProps({ model: { name: 'Grace' } })
    expect(wrapper.find('.el-input-group__prepend').text()).toBe('Grace')
    await wrapper.find('input').setValue('Hopper')
    expect(wrapper.emitted('update:model')!.at(-1)![0]).toEqual({ name: 'Hopper' })
    expect(onInput).toHaveBeenCalledTimes(1)
    expect(onInput.mock.calls[0][1]).toBe('Hopper')
    wrapper.destroy()
  })

  it('preserves Autocomplete native slot parameters and selection binding', async () => {
    const suggestion = { value: 'Ada', detail: '工程师' }
    const renderSuggestion = vi.fn(({ field, slotProps }) => [
      h('span', { class: 'suggestion' }, `${field.fieldKey}: ${slotProps.item.detail}`)
    ])
    const onSelect = vi.fn()
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: '' },
        items: [{ fieldKey: 'name', type: 'autocomplete', component: {
          props: { fetchSuggestions: (_query: string, done: (items: unknown[]) => void) => done([suggestion]) },
          slots: { default: 'suggestion' }, listeners: { select: onSelect }
        } }]
      },
      scopedSlots: { suggestion: renderSuggestion }
    })
    const autocomplete = wrapper.findComponent({ name: 'ElAutocomplete' })
    ;(autocomplete.vm as any).getData('A')
    await Vue.nextTick()
    expect(wrapper.find('.suggestion').text()).toBe('name: 工程师')
    expect(renderSuggestion.mock.calls.at(-1)![0].slotProps.item).toBe(suggestion)
    await wrapper.find('.suggestion').trigger('click')
    expect(wrapper.emitted('update:model')!.at(-1)![0]).toEqual({ name: 'Ada' })
    expect(onSelect).toHaveBeenCalledTimes(1)
    wrapper.destroy()
  })

  it('replaces generated options only when the mapped default slot exists', async () => {
    const component = {
      options: [{ label: 'Generated', value: 'generated' }],
      slots: { default: 'missing' }
    }
    const wrapper = mount(ConfigFormForTest, {
      propsData: { model: { choice: '' }, items: [{ fieldKey: 'choice', type: 'select', component }] },
      scopedSlots: {
        grouped: '<el-option-group label="Custom"><el-option label="Ada" value="ada" /></el-option-group>'
      }
    })
    expect(wrapper.findComponent({ name: 'ElOption' }).props('value')).toBe('generated')
    await wrapper.setProps({ items: [{ fieldKey: 'choice', type: 'select', component: {
      ...component, slots: { default: 'grouped' }
    } }] })
    expect(wrapper.findAllComponents({ name: 'ElOption' })).toHaveLength(1)
    expect(wrapper.findComponent({ name: 'ElOptionGroup' }).props('label')).toBe('Custom')
    expect(wrapper.findComponent({ name: 'ElOption' }).props('value')).toBe('ada')
    await wrapper.setProps({ items: [{ fieldKey: 'choice', type: 'select', component }] })
    expect(wrapper.findComponent({ name: 'ElOption' }).props('value')).toBe('generated')
    wrapper.destroy()
  })

  it.each(['component', 'registered'])('supports %s fields without changing their model protocol', async type => {
    const Editor = Vue.extend({
      model: { prop: 'checked', event: 'change' },
      props: ['checked'],
      render(h) {
        return h('button', { on: { click: () => this.$emit('change', !this.checked) } },
          this.$scopedSlots.default?.({ checked: this.checked }))
      }
    })
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { enabled: false }, fieldTypes: { registered: { is: Editor } },
        items: [{ fieldKey: 'enabled', type, component: {
          ...(type === 'component' ? { is: Editor } : {}), slots: { default: 'label' }
        } }]
      },
      scopedSlots: { label: '<span>{{ props.field.fieldKey }}: {{ props.slotProps.checked }}</span>' }
    })
    expect(wrapper.find('button').text()).toBe('enabled: false')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:model')![0][0]).toEqual({ enabled: true })
    wrapper.destroy()
  })
})
