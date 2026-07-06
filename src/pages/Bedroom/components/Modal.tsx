import { useEffect, useRef } from 'react'

interface Props {
  /** 关联标题元素的 id,用于 aria-labelledby */
  titleId: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * 无障碍弹窗容器:role=dialog + aria-modal,支持 Esc 关闭、点击遮罩关闭,
 * 打开时把焦点移入面板、关闭后恢复到触发元素。
 */
export default function Modal({ titleId, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // 把焦点移入面板内第一个可聚焦元素,否则聚焦面板本身
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input, button, textarea, select, [tabindex]:not([tabindex="-1"])',
    )
    ;(focusable ?? panelRef.current)?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 px-6 backdrop-blur-sm"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 outline-none"
      >
        {children}
      </div>
    </div>
  )
}
