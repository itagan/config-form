import { mount } from '@vue/test-utils'
import Vue from 'vue'
import { describe, expect, it, vi } from 'vitest'
import ConfigForm from '../ConfigForm.vue'
import { defineConfigFormTypes } from '../defineConfigFormTypes'

const ConfigFormForTest = ConfigForm as any

describe('ConfigForm', () => {
  it('rejects reserved names in the field type helper', () => {
    expect(() => defineConfigFormTypes()({ input: { is: 'custom-input' } } as any))
      .toThrow(/reserved/)
  })

  it('renders fields and emits immutable model updates', async () => {
    const source = { profile: { name: 'Ada' } }
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: source,
        items: [{
          fieldKey: 'profile.name',
          type: 'input',
          formItemProps: { label: 'Name' }
        }]
      }
    })

    wrapper.findComponent({ name: 'ElInput' }).vm.$emit('input', 'Grace')
    await Vue.nextTick()

    const nextModel = wrapper.emitted('update:model')?.[0]?.[0] as typeof source
    expect(source.profile.name).toBe('Ada')
    expect(nextModel).not.toBe(source)
    expect(nextModel.profile).not.toBe(source.profile)
    expect(nextModel.profile.name).toBe('Grace')
    expect(wrapper.emitted('field-change')?.[0]?.[0]).toMatchObject({
      fieldKey: 'profile.name',
      previousValue: 'Ada',
      value: 'Grace'
    })
  })

  it('supports dynamic visibility and column props', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { kind: 'person', secret: 'hidden' },
        rowProps: { gutter: 20 },
        items: [
          { fieldKey: 'kind', type: 'text', colProps: { span: 8 } },
          {
            fieldKey: 'secret',
            type: 'input',
            visible: ({ model }: any) => model.kind === 'company'
          }
        ]
      }
    })

    expect(wrapper.findAllComponents({ name: 'ElRow' })).toHaveLength(1)
    expect(wrapper.findComponent({ name: 'ElRow' }).props('gutter')).toBe(20)
    expect(wrapper.findAllComponents({ name: 'ElCol' })).toHaveLength(1)
    expect(wrapper.findComponent({ name: 'ElCol' }).props('span')).toBe(8)
  })

  it('maps a composite component value back to multiple model paths', async () => {
    const RangeEditor = Vue.extend({
      name: 'RangeEditor',
      props: ['value'],
      render(h) { return h('button') }
    })
    const source = { start: '09:00', end: '18:00' }
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: source,
        items: [{
          fieldKey: 'start',
          type: 'component',
          binding: {
            map: [
              { fieldPath: 'start', valuePath: 'start' },
              { fieldPath: 'end', valuePath: 'end' }
            ]
          },
          component: { is: RangeEditor }
        }]
      }
    })

    const editor = wrapper.findComponent(RangeEditor)
    expect(editor.props('value')).toEqual(source)
    editor.vm.$emit('input', { start: '10:00', end: '19:00' })
    await Vue.nextTick()

    expect(wrapper.emitted('update:model')?.[0]?.[0]).toEqual({
      start: '10:00',
      end: '19:00'
    })
  })

  it('renders configured slots with update helpers', async () => {
    const source = { name: 'Ada' }
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: source,
        items: [{
          fieldKey: 'name',
          type: 'slot',
          component: { slot: 'nameEditor' }
        }]
      },
      scopedSlots: {
        nameEditor: '<button class="slot-editor" @click="props.setValue(\'Grace\')">{{ props.value }}</button>'
      }
    })

    await wrapper.find('.slot-editor').trigger('click')
    expect(wrapper.emitted('update:model')?.[0]?.[0]).toEqual({ name: 'Grace' })
  })

  it('resets through a cloned controlled update without mutating the model', async () => {
    const source = { profile: { name: 'Ada' } }
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: source,
        items: [{ fieldKey: 'profile.name', type: 'input' }]
      }
    })
    await wrapper.setProps({ model: { profile: { name: 'Grace' } } })

    ;(wrapper.vm as any).resetFields()
    await Vue.nextTick()

    const resetModel = wrapper.emitted('update:model')?.[0]?.[0] as typeof source
    expect(resetModel).toEqual(source)
    expect(resetModel).not.toBe(source)
    expect(resetModel.profile).not.toBe(source.profile)
    expect(source.profile.name).toBe('Ada')
  })

  it('resolves a field component from the current model', async () => {
    const EditorA = Vue.extend({ name: 'EditorA', props: ['value'], render: h => h('div') })
    const EditorB = Vue.extend({ name: 'EditorB', props: ['value'], render: h => h('div') })
    const item = {
      fieldKey: 'name',
      type: 'component',
      component: {
        is: EditorA,
        resolveComponent: ({ model }: any) => model.advanced ? EditorB : undefined
      }
    }
    const wrapper = mount(ConfigFormForTest, {
      propsData: { model: { name: 'Ada', advanced: false }, items: [item] }
    })

    expect(wrapper.findComponent(EditorA).exists()).toBe(true)
    await wrapper.setProps({ model: { name: 'Ada', advanced: true } })
    expect(wrapper.findComponent(EditorB).exists()).toBe(true)
  })

  it('supports custom model protocols and preserves configured listeners', async () => {
    const Toggle = Vue.extend({
      name: 'BusinessToggle',
      props: ['checked'],
      render: h => h('button')
    })
    const onChange = vi.fn()
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { enabled: false },
        items: [{
          fieldKey: 'enabled',
          type: 'component',
          component: {
            is: Toggle,
            model: {
              prop: 'checked',
              event: 'change',
              valueFromEvent: (_context: any, detail: any) => detail.checked
            },
            listeners: { change: onChange }
          }
        }]
      }
    })

    const toggle = wrapper.findComponent(Toggle)
    expect(toggle.props('checked')).toBe(false)
    toggle.vm.$emit('change', { checked: true })
    await Vue.nextTick()
    expect(wrapper.emitted('update:model')?.[0]?.[0]).toEqual({ enabled: true })
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0]).toMatchObject({ fieldKey: 'enabled', value: false })
  })

  it('renders field hints and applies form-level interaction state', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: 'Ada' },
        readonly: true,
        hintOptions: { mode: 'title' },
        items: [{ fieldKey: 'name', type: 'input', hint: '只读姓名' }]
      }
    })

    expect(wrapper.find('.config-form__hint-target').attributes('title')).toBe('只读姓名')
    expect(wrapper.findComponent({ name: 'ElInput' }).props('disabled')).toBe(true)
    expect(wrapper.findComponent({ name: 'ElInput' }).props('readonly')).toBe(true)
  })

  it('merges registered field type defaults with item props', () => {
    const MoneyEditor = Vue.extend({
      name: 'MoneyEditor',
      props: ['currency', 'precision', 'value'],
      render: h => h('div')
    })
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { amount: 20 },
        fieldTypes: {
          money: { is: MoneyEditor, props: { currency: 'CNY', precision: 2 } }
        },
        items: [{
          fieldKey: 'amount',
          type: 'money',
          component: { props: { precision: 4 } }
        }]
      }
    })

    expect(wrapper.findComponent(MoneyEditor).props()).toMatchObject({
      value: 20,
      currency: 'CNY',
      precision: 4
    })
  })

  it('maps business option fields for select controls', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { status: 'enabled' },
        items: [{
          fieldKey: 'status',
          type: 'select',
          component: {
            options: [{ text: '启用', code: 'enabled', locked: true }],
            optionProps: { label: 'text', value: 'code', disabled: 'locked' }
          }
        }]
      }
    })

    const option = wrapper.findComponent({ name: 'ElOption' })
    expect(option.props()).toMatchObject({ label: '启用', value: 'enabled', disabled: true })
  })

  it('composes consecutive controlled field updates before props are written back', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { firstName: 'Ada', lastName: 'Lovelace' },
        items: [
          { fieldKey: 'firstName', type: 'input' },
          { fieldKey: 'lastName', type: 'input' }
        ]
      }
    })

    ;(wrapper.vm as any).setFieldValue('firstName', 'Grace')
    ;(wrapper.vm as any).setFieldValue('lastName', 'Hopper')

    const updates = wrapper.emitted('update:model') || []
    expect(updates).toHaveLength(2)
    expect(updates[1][0]).toEqual({ firstName: 'Grace', lastName: 'Hopper' })
    expect((wrapper.vm as any).getModel()).toEqual({ firstName: 'Grace', lastName: 'Hopper' })
  })

  it('updates multiple paths in one public setFieldsValue transaction', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { profile: { name: 'Ada' }, enabled: false },
        items: [
          { fieldKey: 'profile.name', type: 'input' },
          { fieldKey: 'enabled', type: 'switch' }
        ]
      }
    })

    ;(wrapper.vm as any).setFieldsValue({ 'profile.name': 'Grace', enabled: true })

    expect(wrapper.emitted('update:model')).toHaveLength(1)
    expect(wrapper.emitted('update:model')?.[0]?.[0]).toEqual({
      profile: { name: 'Grace' },
      enabled: true
    })
    expect(wrapper.emitted('field-change')).toHaveLength(2)
  })

  it('focuses a mounted field and reports unmapped targets', async () => {
    const wrapper = mount(ConfigFormForTest, {
      attachTo: document.body,
      propsData: {
        model: { name: 'Ada', hidden: 'x' },
        items: [
          { fieldKey: 'name', type: 'input' },
          { fieldKey: 'hidden', type: 'input', visible: () => false }
        ]
      }
    })

    try {
      await expect((wrapper.vm as any).focusField('name')).resolves.toBe(true)
      const input = wrapper.find('input').element as HTMLInputElement
      expect(document.activeElement).toBe(input)

      await expect((wrapper.vm as any).focusField('unknown')).resolves.toBe(false)
      await expect((wrapper.vm as any).focusField('hidden')).resolves.toBe(false)
    } finally {
      wrapper.destroy()
    }
  })

  it('validates single fields through a Promise and tolerates unknown props', async () => {
    const model = { name: '' }
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model,
        formProps: { rules: { name: [{ required: true, message: 'name required' }] } },
        items: [{ fieldKey: 'name', type: 'input' }]
      }
    })

    const vm = wrapper.vm as any
    await expect(vm.validateField('name')).resolves.toBe(false)
    expect(wrapper.find('.el-form-item__error').text()).toBe('name required')

    vm.setFieldValue('name', 'Ada')
    const nextModel = wrapper.emitted('update:model')?.at(-1)?.[0] as typeof model
    wrapper.setProps({ model: nextModel })
    await Vue.nextTick()
    await expect(vm.validateField('name')).resolves.toBe(true)

    let callbackMessage: string | undefined
    await expect(vm.validateField('unknown', (message: string) => { callbackMessage = message }))
      .resolves.toBe(false)
    expect(callbackMessage).toBeUndefined()
  })

  it('scrolls to the first error field and focuses it', async () => {
    const scrollIntoView = vi.fn()
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = scrollIntoView as never
    try {
      const wrapper = mount(ConfigFormForTest, {
        attachTo: document.body,
        propsData: {
          model: { name: '', remark: '' },
          formProps: {
            rules: {
              name: [{ required: true, message: 'name required' }],
              remark: [{ required: true, message: 'remark required' }]
            }
          },
          items: [
            { fieldKey: 'name', type: 'input' },
            { fieldKey: 'remark', type: 'input' }
          ]
        }
      })

      await expect((wrapper.vm as any).validate()).resolves.toBe(false)
      await expect((wrapper.vm as any).scrollToFirstError()).resolves.toBe(true)
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' })
      expect(document.activeElement).toBe(wrapper.findAll('input').at(0)?.element)

      wrapper.findAllComponents({ name: 'ElInput' }).at(0).vm.$emit('input', 'Ada')
      const nextModel = wrapper.emitted('update:model')?.at(-1)?.[0] as Record<string, string>
      wrapper.setProps({ model: nextModel })
      await Vue.nextTick()
      await (wrapper.vm as any).validate()
      await expect((wrapper.vm as any).scrollToFirstError()).resolves.toBe(true)
      expect(document.activeElement).toBe(wrapper.findAll('input').at(1)?.element)

      wrapper.destroy()
    } finally {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView
    }
  })

  it('navigates fields with Enter and Shift+Enter, skipping disabled fields', async () => {
    const wrapper = mount(ConfigFormForTest, {
      attachTo: document.body,
      propsData: {
        navigationOptions: { enabled: true },
        model: { first: '', second: '', third: '' },
        items: [
          { fieldKey: 'first', type: 'input' },
          { fieldKey: 'second', type: 'input', disabled: true },
          { fieldKey: 'third', type: 'input' }
        ]
      }
    })

    try {
      const inputs = () => Array.from((wrapper.element as HTMLElement).querySelectorAll('input'))
      const press = (target: HTMLElement, init: KeyboardEventInit = {}) => {
        target.focus()
        return target.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', bubbles: true, cancelable: true, ...init
        }))
      }

      press(inputs()[0])
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[2])

      press(inputs()[2])
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[2])

      press(inputs()[2], { shiftKey: true })
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[0])
    } finally {
      wrapper.destroy()
    }
  })

  it('leaves Enter untouched when navigation is off, composing or modified', async () => {
    const wrapper = mount(ConfigFormForTest, {
      attachTo: document.body,
      propsData: {
        navigationOptions: { enabled: true },
        model: { first: '', second: '' },
        items: [
          { fieldKey: 'first', type: 'input' },
          { fieldKey: 'second', type: 'input' }
        ]
      }
    })

    try {
      const inputs = () => Array.from((wrapper.element as HTMLElement).querySelectorAll('input'))
      const press = (target: HTMLElement, init: KeyboardEventInit = {}) => {
        target.focus()
        return target.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', bubbles: true, cancelable: true, ...init
        }))
      }

      press(inputs()[0], { isComposing: true })
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[0])

      press(inputs()[0], { ctrlKey: true })
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[0])

      await wrapper.setProps({ navigationOptions: { enabled: false } })
      press(inputs()[0])
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[0])

      await wrapper.setProps({ navigationOptions: undefined })
      press(inputs()[0])
      await Vue.nextTick()
      expect(document.activeElement).toBe(inputs()[0])
    } finally {
      wrapper.destroy()
    }
  })

  it('delegates tooltip hints through a single singleton tooltip', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: 'Ada', remark: '', plain: '' },
        hintOptions: { mode: 'tooltip', field: true },
        items: [
          { fieldKey: 'name', type: 'input' },
          { fieldKey: 'remark', type: 'input' },
          { fieldKey: 'plain', type: 'input', hint: false }
        ]
      }
    })

    expect(wrapper.findAllComponents({ name: 'ElTooltip' })).toHaveLength(1)
    const nameItem = wrapper.find('[data-config-form-field-prop="name"]')
    const remarkItem = wrapper.find('[data-config-form-field-prop="remark"]')
    const plainItem = wrapper.find('[data-config-form-field-prop="plain"]')
    expect(nameItem.attributes('data-config-form-hint')).toBe('Ada')
    expect(remarkItem.attributes('data-config-form-hint')).toBeUndefined()
    expect(plainItem.attributes('data-config-form-hint')).toBeUndefined()
    expect(wrapper.find('.config-form__hint-target').attributes('title')).toBeUndefined()
    wrapper.destroy()
  })

  it('replaces native title with the delegated tooltip in tooltip mode', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: 'Ada' },
        hintOptions: { mode: 'tooltip' },
        items: [{
          fieldKey: 'name',
          type: 'input',
          hint: '姓名提示',
          formItemProps: { title: '原生标题' }
        }]
      }
    })

    const nameItem = wrapper.find('[data-config-form-field-prop="name"]')
    expect(nameItem.attributes('data-config-form-hint')).toBe('姓名提示')
    expect(nameItem.attributes('title')).toBeUndefined()
    wrapper.destroy()
  })

  it('keeps hintTrigger content as a trigger-area marker', () => {
    const wrapper = mount(ConfigFormForTest, {
      propsData: {
        model: { name: 'Ada', remark: '' },
        hintOptions: { mode: 'tooltip', hintTrigger: 'content', field: true },
        items: [
          { fieldKey: 'name', type: 'input' },
          { fieldKey: 'remark', type: 'input' }
        ]
      }
    })

    expect(wrapper.find('[data-config-form-field-prop="name"]')
      .attributes('data-config-form-hint-trigger')).toBe('content')
    expect(wrapper.find('[data-config-form-field-prop="remark"]')
      .attributes('data-config-form-hint-trigger')).toBeUndefined()
    wrapper.destroy()
  })

  it('shows the singleton tooltip on field focus and manages aria-describedby', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(ConfigFormForTest, {
        attachTo: document.body,
        propsData: {
          model: { name: 'Ada' },
          hintOptions: { mode: 'tooltip' },
          items: [{ fieldKey: 'name', type: 'input', hint: '姓名提示' }]
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      await Vue.nextTick()
      // jsdom 的 programmatic focus 不派发冒泡的 focusin，直接模拟浏览器焦点行为。
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      await Vue.nextTick()
      const tooltip = wrapper.findComponent({ name: 'ElTooltip' })
      const tooltipId = (tooltip.vm as any).tooltipId as string

      expect(input.getAttribute('aria-describedby')).toBe(tooltipId)
      vi.advanceTimersByTime(300)
      await Vue.nextTick()
      expect((tooltip.vm as any).showPopper).toBe(true)

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await Vue.nextTick()
      expect((tooltip.vm as any).showPopper).toBe(false)
      expect(input.getAttribute('aria-describedby')).toBeNull()
      wrapper.destroy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('limits content-trigger hints to the field content area', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(ConfigFormForTest, {
        attachTo: document.body,
        propsData: {
          model: { name: 'Ada' },
          hintOptions: { mode: 'tooltip', hintTrigger: 'content' },
          items: [{
            fieldKey: 'name',
            type: 'input',
            hint: '姓名提示',
            formItemProps: { label: '姓名' }
          }]
        }
      })

      const nameItem = wrapper.find('[data-config-form-field-prop="name"]').element
      const label = nameItem.querySelector('.el-form-item__label') as HTMLElement
      const input = nameItem.querySelector('input') as HTMLInputElement
      const hover = (target: HTMLElement) => target.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true })
      )

      await Vue.nextTick()
      hover(label)
      await Vue.nextTick()
      vi.advanceTimersByTime(300)
      await Vue.nextTick()
      const tooltip = wrapper.findComponent({ name: 'ElTooltip' })
      expect((tooltip.vm as any).showPopper).toBe(false)

      hover(input)
      await Vue.nextTick()
      vi.advanceTimersByTime(300)
      await Vue.nextTick()
      expect((tooltip.vm as any).showPopper).toBe(true)
      wrapper.destroy()
    } finally {
      vi.useRealTimers()
    }
  })
})
