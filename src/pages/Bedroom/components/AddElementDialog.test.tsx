import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddElementDialog from './AddElementDialog'

describe('AddElementDialog', () => {
  it('名称为空时确认按钮禁用', () => {
    render(<AddElementDialog onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
  })

  it('输入名称后提交,回调收到去空格的名称', async () => {
    const onSubmit = vi.fn()
    render(<AddElementDialog onSubmit={onSubmit} onClose={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox', { name: '元素名称' }), '  书桌  ')
    await userEvent.click(screen.getByRole('button', { name: '确认' }))
    expect(onSubmit).toHaveBeenCalledWith('书桌')
  })

  it('点击取消触发 onClose', async () => {
    const onClose = vi.fn()
    render(<AddElementDialog onSubmit={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
