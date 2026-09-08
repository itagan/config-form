import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConfigFormHintTooltip } from '../useConfigFormHintTooltip'

// 手动交付观察回调，使同一微任务内的重复通知与卸载竞争可以确定性复现。
let observers: Array<{ notify: () => void, disconnect: ReturnType<typeof vi.fn> }>

function createContainer() {
  const container = document.createElement('div')
  container.setAttribute('data-config-form-root', '')
  container.innerHTML = '<input data-config-form-hint="tip">'
  document.body.appendChild(container)
  return container
}

function createHarness() {
  const container = shallowRef<HTMLElement | null>(createContainer())
  const updatePopper = vi.fn()
  const destroy = vi.fn()
  const wrapper = mount(defineComponent({
    setup() {
      useConfigFormHintTooltip({
        containerRef: container,
        tooltipRef: shallowRef({
          tooltipId: 'test-hint', showPopper: true,
          handleShowPopper: vi.fn(), handleClosePopper: vi.fn(),
          setExpectedState: vi.fn(), updatePopper, doDestroy: destroy
        }),
        content: ref('')
      })
      return {}
    },
    render(h) { return h('div') }
  }))
  const activate = async () => {
    container.value!.querySelector('input')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await nextTick()
    updatePopper.mockClear()
  }
  return { container, wrapper, activate, updatePopper, destroy }
}

describe('Hint position refresh scheduling', () => {
  beforeEach(() => {
    observers = []
    vi.stubGlobal('MutationObserver', class {
      disconnect = vi.fn()
      constructor(callback: () => void) {
        observers.push({ notify: callback, disconnect: this.disconnect })
      }
      observe = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('coalesces notifications and allows the next batch to refresh again', async () => {
    const harness = createHarness()
    try {
      await harness.activate()
      observers[0].notify()
      observers[0].notify()
      observers[0].notify()
      expect(harness.updatePopper).not.toHaveBeenCalled()
      await Promise.resolve()
      await nextTick()
      expect(harness.updatePopper).toHaveBeenCalledTimes(1)
      observers[0].notify()
      await Promise.resolve()
      await nextTick()
      expect(harness.updatePopper).toHaveBeenCalledTimes(2)
    } finally {
      harness.wrapper.destroy()
    }
  })

  it('cancels the old container batch while allowing new container refreshes', async () => {
    const harness = createHarness()
    try {
      await harness.activate()
      // 根替换的 watcher 先入队，旧观察通知随后排队，必须在 watcher 清理后失效。
      harness.container.value = createContainer()
      observers[0].notify()
      await nextTick()
      await Promise.resolve()
      expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
      expect(harness.updatePopper).not.toHaveBeenCalled()
      await harness.activate()
      observers[1].notify()
      await Promise.resolve()
      await nextTick()
      expect(harness.updatePopper).toHaveBeenCalledTimes(1)
    } finally {
      harness.wrapper.destroy()
    }
  })

  it('discards a queued refresh on unmount', async () => {
    const harness = createHarness()
    await harness.activate()
    observers[0].notify()
    harness.wrapper.destroy()
    await Promise.resolve()
    await nextTick()
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(harness.updatePopper).not.toHaveBeenCalled()
    expect(harness.destroy).toHaveBeenLastCalledWith(true)
  })

  it('does not refresh when the active target has been removed', async () => {
    const harness = createHarness()
    try {
      await harness.activate()
      harness.container.value!.innerHTML = ''
      observers[0].notify()
      await Promise.resolve()
      await nextTick()
      expect(harness.updatePopper).not.toHaveBeenCalled()
    } finally {
      harness.wrapper.destroy()
    }
  })
})
