import { useCallback } from 'react'
import { screenToRoom } from './geometry'

export interface DragDelta {
  /** 房间本地坐标增量（已抵消房间旋转与缩放） */
  local: { dx: number; dy: number }
  /** 屏幕坐标增量（原始 client 坐标差） */
  screen: { dx: number; dy: number }
}

interface Options<T> {
  roomRotation: number
  effectiveScale: number
  /** 命中这些选择器的目标不触发拖拽（如旋转/删除/调整手柄） */
  ignoreSelector?: string
  /** 拖拽开始时快照上下文（如原始坐标、固定端、最大长度等），返回值透传给 onDrag */
  onStart: (e: React.PointerEvent) => T
  /** 指针移动时回调；delta 已换算为房间本地坐标，start 为 onStart 的返回值 */
  onDrag: (delta: DragDelta, start: T) => void
}

/**
 * 统一鼠标/触摸/触控笔的房间内拖拽。基于 Pointer Events,配合元素上的
 * `touch-action: none` 即可在移动端阻止页面滚动,无需分别写 mouse/touch 两套逻辑。
 *
 * 拖拽全程在 window 上监听 pointermove/pointerup,因此指针移出元素也能持续跟随。
 */
export function useRoomDrag<T>({ roomRotation, effectiveScale, ignoreSelector, onStart, onDrag }: Options<T>) {
  return useCallback((e: React.PointerEvent) => {
    if (ignoreSelector && (e.target as HTMLElement).closest(ignoreSelector)) return
    e.preventDefault()
    const startClientX = e.clientX
    const startClientY = e.clientY
    const snapRotation = roomRotation
    const snapScale = effectiveScale
    const start = onStart(e)

    const move = (ev: PointerEvent) => {
      const sdx = ev.clientX - startClientX
      const sdy = ev.clientY - startClientY
      onDrag({ screen: { dx: sdx, dy: sdy }, local: screenToRoom(sdx, sdy, snapRotation, snapScale) }, start)
    }
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }, [roomRotation, effectiveScale, ignoreSelector, onStart, onDrag])
}
