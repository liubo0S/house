import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

function renderModal(onClose = vi.fn()) {
  render(
    <Modal titleId="t" onClose={onClose}>
      <h2 id="t">标题</h2>
      <button type="button">确认</button>
    </Modal>,
  )
  return onClose
}

describe('Modal', () => {
  it('渲染为带 aria 属性的 dialog', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 't')
  })

  it('打开时把焦点移入面板内的可聚焦元素', () => {
    renderModal()
    expect(screen.getByRole('button', { name: '确认' })).toHaveFocus()
  })

  it('按 Esc 触发 onClose', async () => {
    const onClose = renderModal()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('点击遮罩层触发 onClose', () => {
    const onClose = renderModal()
    // 遮罩是 dialog 的父级
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement
    fireEvent.mouseDown(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('点击面板内部不触发 onClose', () => {
    const onClose = renderModal()
    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
