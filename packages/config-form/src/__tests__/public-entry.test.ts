import { describe, expect, it } from 'vitest'
import ConfigFormDefault, {
  ConfigForm,
  createConfigForm,
  defineConfigFormType,
  defineConfigFormTypes,
  defineConfigFormItems
} from '../index'

describe('public entry', () => {
  it('exports the component and generic component view', () => {
    expect(ConfigFormDefault).toBe(ConfigForm)
    expect(createConfigForm()).toBe(ConfigForm)
    const runtimeProps = (ConfigForm as any).props
    expect(runtimeProps.model.required).toBe(true)
    expect(runtimeProps.items.required).toBe(true)
    expect(runtimeProps.model.default).toBeUndefined()
    expect(runtimeProps.items.default).toBeUndefined()
  })

  it('exports configuration helpers', () => {
    expect(defineConfigFormItems([])).toEqual([])
    expect(typeof defineConfigFormType).toBe('function')
    expect(typeof defineConfigFormTypes).toBe('function')
  })
})
