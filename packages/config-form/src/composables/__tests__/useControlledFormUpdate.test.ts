import { describe, expect, it, vi } from 'vitest'
import { useControlledFormUpdate } from '../useControlledFormUpdate'

describe('useControlledFormUpdate', () => {
  it('combines synchronous writes before the controlled prop is returned', () => {
    const source = { first: 'Ada', last: 'Lovelace' }
    const emitUpdate = vi.fn()
    const update = useControlledFormUpdate({
      getModel: () => source,
      emitUpdate,
      emitFieldChange: vi.fn()
    })

    update.setFieldValue('first', 'Grace')
    update.setFieldValue('last', 'Hopper')

    expect(emitUpdate).toHaveBeenNthCalledWith(1, { first: 'Grace', last: 'Lovelace' })
    expect(emitUpdate).toHaveBeenNthCalledWith(2, { first: 'Grace', last: 'Hopper' })
  })

  it('trusts the controlled prop again after the current microtask', async () => {
    let source = { name: 'Ada', revision: 1 }
    const emitUpdate = vi.fn()
    const update = useControlledFormUpdate({
      getModel: () => source,
      emitUpdate,
      emitFieldChange: vi.fn()
    })

    update.setFieldValue('name', 'Grace')
    await Promise.resolve()
    source = { name: 'Server', revision: 2 }
    update.setFieldValue('name', 'Hopper')

    expect(emitUpdate).toHaveBeenLastCalledWith({ name: 'Hopper', revision: 2 })
  })
})
