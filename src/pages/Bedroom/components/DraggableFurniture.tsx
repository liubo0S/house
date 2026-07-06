import { useCallback } from 'react'
import { useLatestRef } from '../../../hooks/useLatestRef'
import { type Furniture, KIND_SPECS, normalizeFurniture } from '../model/furniture'
import { clamp, clampToRoom, maxLenFromEnd } from '../model/geometry'
import { type DragDelta, useRoomDrag } from '../hooks/useRoomDrag'
import { FURNITURE_VIEWS } from '../views/registry'
import { RotateIcon } from './icons'

interface Props {
  item: Furniture
  roomRotation: number
  effectiveScale: number
  deleteMode: boolean
  onChange: (next: Furniture) => void
  onDeleteClick: () => void
}

/** 一次长度调整拖拽开始时的快照 */
interface ResizeStart {
  cos: number
  sin: number
  endX: number
  endY: number
  origLen: number
  maxLen: number
  thickness: number
  sign: 1 | -1
}

function resizeStart(f: Furniture, sign: 1 | -1): ResizeStart {
  const { thickness, minLen } = KIND_SPECS[f.kind]
  const rad = (f.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx0 = f.x + f.len / 2
  const cy0 = f.y + thickness / 2
  // 固定端在 -sign 方向:右侧手柄固定左端,左侧手柄固定右端
  const endX = cx0 - sign * (f.len / 2) * cos
  const endY = cy0 - sign * (f.len / 2) * sin
  const maxLen = maxLenFromEnd(endX, endY, f.rotation, thickness, minLen, sign)
  return { cos, sin, endX, endY, origLen: f.len, maxLen, thickness, sign }
}

function resizeApply(local: { dx: number; dy: number }, st: ResizeStart, minLen: number): Pick<Furniture, 'x' | 'y' | 'len'> {
  const delta = st.sign * (local.dx * st.cos + local.dy * st.sin)
  const newLen = clamp(st.origLen + delta, minLen, st.maxLen)
  const newCx = st.endX + st.sign * (newLen / 2) * st.cos
  const newCy = st.endY + st.sign * (newLen / 2) * st.sin
  return { x: newCx - newLen / 2, y: newCy - st.thickness / 2, len: newLen }
}

/**
 * 承载拖拽/旋转/长度调整交互的通用家具容器。
 * 自身受控（状态由父级管理），外观按 item.kind 从注册表渲染。
 */
export default function DraggableFurniture({ item, roomRotation, effectiveScale, deleteMode, onChange, onDeleteClick }: Props) {
  const spec = KIND_SPECS[item.kind]
  const itemRef = useLatestRef(item)
  const View = FURNITURE_VIEWS[item.kind]

  const update = useCallback((updater: (prev: Furniture) => Furniture) => {
    onChange(normalizeFurniture(updater(itemRef.current)))
  }, [onChange, itemRef])

  // 拖拽移动
  const onDragStart = useCallback(() => ({ ...itemRef.current }), [itemRef])
  const onDrag = useCallback(({ local }: DragDelta, start: Furniture) => {
    const clamped = clampToRoom(start.x + local.dx, start.y + local.dy, start.len, spec.thickness, start.rotation)
    update(prev => ({ ...prev, ...clamped }))
  }, [update, spec.thickness])
  const onBodyPointerDown = useRoomDrag({
    roomRotation,
    effectiveScale,
    ignoreSelector: '[data-rotate-handle],[data-resize-handle],[data-delete-handle]',
    onStart: onDragStart,
    onDrag,
  })

  // 旋转
  const onRotateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    update(prev => ({ ...prev, rotation: prev.rotation + 90 }))
  }, [update])

  // 长度调整
  const onResize = useCallback(({ local }: DragDelta, st: ResizeStart) => {
    update(prev => ({ ...prev, ...resizeApply(local, st, spec.minLen) }))
  }, [update, spec.minLen])
  const onResizeRightStart = useCallback(() => resizeStart(itemRef.current, 1), [itemRef])
  const onResizeLeftStart = useCallback(() => resizeStart(itemRef.current, -1), [itemRef])
  const onResizeRightPointerDown = useRoomDrag({ roomRotation, effectiveScale, onStart: onResizeRightStart, onDrag: onResize })
  const onResizeLeftPointerDown = useRoomDrag({ roomRotation, effectiveScale, onStart: onResizeLeftStart, onDrag: onResize })

  const rotateLabel = item.name ? `旋转${item.name} 90°` : '旋转 90°'

  return (
    <div
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        width: item.len,
        height: spec.thickness,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: 'center',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onBodyPointerDown}
    >
      <View item={item} />

      {item.removable && deleteMode && (
        <button
          data-delete-handle
          type="button"
          title="删除元素"
          aria-label={item.name ? `删除元素 ${item.name}` : '删除元素'}
          style={{ position: 'absolute', top: -9, right: -9, zIndex: 20, transform: `rotate(${-item.rotation}deg)` }}
          className="grid size-5 place-items-center rounded-full border border-white/70 bg-red-500 text-sm font-bold leading-none text-white shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDeleteClick() }}
        >
          <span className="-mt-px block leading-none">−</span>
        </button>
      )}

      {/* 旋转按钮 */}
      <button
        data-rotate-handle
        type="button"
        title="点击旋转 90°"
        aria-label={rotateLabel}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
        className="grid size-7 cursor-pointer place-items-center rounded-full border border-amber-100/40 bg-amber-300 p-0 text-slate-900 shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
        onClick={onRotateClick}
      >
        <RotateIcon />
      </button>

      {spec.resizable && (
        <>
          {/* 左侧长度调整 handle */}
          <div
            data-resize-handle
            title="拖拽调整长度"
            style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 12, height: 28, cursor: 'ew-resize', touchAction: 'none' }}
            className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
            onPointerDown={onResizeLeftPointerDown}
          >
            <div className="flex gap-0.5">
              <div className="h-3 w-px rounded-full bg-amber-200/70" />
              <div className="h-3 w-px rounded-full bg-amber-200/70" />
            </div>
          </div>

          {/* 右侧长度调整 handle */}
          <div
            data-resize-handle
            title="拖拽调整长度"
            style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 12, height: 28, cursor: 'ew-resize', touchAction: 'none' }}
            className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
            onPointerDown={onResizeRightPointerDown}
          >
            <div className="flex gap-0.5">
              <div className="h-3 w-px rounded-full bg-amber-200/70" />
              <div className="h-3 w-px rounded-full bg-amber-200/70" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
