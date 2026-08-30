/* eslint-disable vue/one-component-per-file */
import ElementUI from 'element-ui'
import { describe, expect, it } from 'vitest'
import Vue from 'vue'
import ConfigForm, {
  ConfigForm as NamedConfigForm,
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineConfigFormItems
} from '@itagan/config-form'
import '@itagan/config-form/style.css'

Vue.use(ElementUI)

describe('minimum peer package consumer', () => {
  it('loads the built public entry and keeps runtime exports aligned', () => {
    expect(Vue.version).toBe('2.7.1')
    expect(ElementUI.version).toBe('2.4.9')
    expect(NamedConfigForm).toBe(ConfigForm)
    expect(createConfigForm()).toBe(ConfigForm)
    expect(defineConfigFormItems([])).toEqual([])
    const field = { is: 'custom-field' }
    expect(defineConfigFormType()(field)).toBe(field)
    const fields = { custom: field }
    expect(defineConfigFormTypes()(fields)).toBe(fields)
  })

  it('mounts, updates and validates with minimum peers', async () => {
    const EmployeeField = Vue.extend({
      props: ['selectedId'],
      render(createElement) {
        return createElement('button', {
          class: 'minimum-employee-field',
          attrs: { type: 'button', 'data-selected-id': this.selectedId as string },
          on: { click: () => this.$emit('user-confirm', { id: 'user-2' }) }
        }, [String(this.selectedId)])
      }
    })
    const fieldTypes = defineConfigFormTypes()({
      employee: {
        is: EmployeeField as any,
        model: {
          prop: 'selectedId',
          event: 'user-confirm',
          valueFromEvent: (_context, ...args) => (args[0] as { id: string }).id
        }
      }
    })
    const host = new (Vue.extend({
      data: () => ({ model: { name: 'Alice', employeeId: 'user-1' } }),
      render(createElement) {
        return createElement(ConfigForm as any, {
          ref: 'configForm',
          props: {
            model: this.model,
            fieldTypes,
            items: [
              {
                fieldKey: 'name',
                type: 'input',
                formItemProps: { rules: [{ required: true, message: '请输入姓名' }] }
              },
              { fieldKey: 'employeeId', type: 'employee' }
            ]
          },
          on: { 'update:model': (model: { name: string, employeeId: string }) => { this.model = model } }
        })
      }
    }))().$mount()
    document.body.appendChild(host.$el)
    await Vue.nextTick()

    const input = host.$el.querySelector('input') as HTMLInputElement
    input.value = 'Bob'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await Vue.nextTick()
    expect(host.model.name).toBe('Bob')

    const employee = host.$el.querySelector('.minimum-employee-field') as HTMLButtonElement
    employee.click()
    await Vue.nextTick()
    expect(host.model.employeeId).toBe('user-2')

    host.model = { name: '', employeeId: 'user-2' }
    await Vue.nextTick()
    expect(await (host.$refs.configForm as any).validate()).toBe(false)
    expect(host.$el.textContent).toContain('请输入姓名')
    host.$destroy()
    host.$el.remove()
  })
})
